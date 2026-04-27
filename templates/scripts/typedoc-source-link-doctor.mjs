#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const requiredConfigs = ["typedoc.json", "typedoc-frontend.json", "typedoc-ci.json", "package.json"];
const errors = [];
const warnings = [];

function finish(payload, exitCode) {
  fs.writeSync(1, `${JSON.stringify(payload, null, 2)}\n`);
  process.exit(exitCode);
}

function stripJsonCommentsAndTrailingCommas(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/,\s*([}\]])/g, "$1");
}

function readJsonc(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(stripJsonCommentsAndTrailingCommas(fs.readFileSync(absolutePath, "utf8")));
  } catch (error) {
    errors.push(`Invalid JSON/JSONC in ${relativePath}: ${error.message}`);
    return null;
  }
}

function runNode(args, env = {}) {
  const childEnv = { ...process.env, ...env };
  for (const key of Object.keys(childEnv)) {
    if (key.startsWith("npm_")) delete childEnv[key];
  }
  if (!env.CI && !env.GITHUB_ACTIONS) delete childEnv.CI;
  return spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    env: childEnv,
    timeout: 15000,
  });
}

for (const config of requiredConfigs) readJsonc(config);

const pkg = readJsonc("package.json");
if (pkg) {
  for (const scriptName of [
    "typedoc:json",
    "typedoc:health",
    "typedoc:config:auto",
    "typedoc:html:local",
    "typedoc:html:github",
    "ai:graph:build",
    "ai:graph:doctor",
    "ai:preflight",
    "ai:spec",
  ]) {
    if (!pkg.scripts?.[scriptName]) errors.push(`package.json missing script: ${scriptName}`);
  }
}

const scriptPath = "scripts/typedoc-source-config.mjs";
if (!fs.existsSync(path.join(root, scriptPath))) {
  errors.push(`Missing ${scriptPath}`);
} else {
  for (const args of [
    [scriptPath, "local", "typedoc.json"],
    [scriptPath, "github", "typedoc.json"],
    [scriptPath, "local", "typedoc-frontend.json"],
    [scriptPath, "github", "typedoc-frontend.json"],
  ]) {
    const env = args[1] === "github" ? { TYPEDOC_GITHUB_REPOSITORY: "example/repo", TYPEDOC_GITHUB_REVISION: "main" } : {};
    const result = runNode(args, env);
    if (result.status !== 0) {
      errors.push(`Failed: node ${args.join(" ")}\n${result.stderr || result.stdout}`);
    }
    if (result.error) {
      errors.push(`Failed: node ${args.join(" ")}\n${result.error.message}`);
    }
  }
}

for (const [file, expected] of [
  ["typedoc.local.generated.json", "vscode://file"],
  ["typedoc.github.generated.json", "https://github.com/example/repo/blob/main/"],
  ["typedoc-frontend.local.generated.json", "vscode://file"],
  ["typedoc-frontend.github.generated.json", "https://github.com/example/repo/blob/main/"],
]) {
  const data = readJsonc(file);
  if (!data) continue;
  if (!String(data.sourceLinkTemplate || "").startsWith(expected)) {
    errors.push(`${file} sourceLinkTemplate did not start with ${expected}: ${data.sourceLinkTemplate}`);
  }
}

const typedocApiPath = path.join(root, "typedoc-api.json");
const typedocApiText = fs.existsSync(typedocApiPath) ? fs.readFileSync(typedocApiPath, "utf8") : "";
if (typedocApiText && /github\.com\/your-username\/your-repo/i.test(typedocApiText)) {
  errors.push("typedoc-api.json still contains placeholder GitHub source links.");
}
if (!typedocApiText) warnings.push("typedoc-api.json not found. Run npm run typedoc:json after npm install.");

finish({
  ok: errors.length === 0,
  errors,
  warnings,
  checked: requiredConfigs.concat([
    "scripts/typedoc-source-config.mjs",
    "typedoc.local.generated.json",
    "typedoc.github.generated.json",
    "typedoc-frontend.local.generated.json",
    "typedoc-frontend.github.generated.json",
  ]),
}, errors.length ? 1 : 0);
