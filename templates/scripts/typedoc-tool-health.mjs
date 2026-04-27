#!/usr/bin/env node
/**
 * TypeDoc tooling health check.
 *
 * This validates the hybrid local/GitHub TypeDoc toolchain without requiring a full app docs build.
 * It proves configs parse, generated local/GitHub configs are produced, source link templates are
 * correct, package scripts exist, and the local output check is executable.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const errors = [];
const warnings = [];
const generated = [];

function finish(payload, exitCode) {
  fs.writeSync(1, `${JSON.stringify(payload, null, 2)}\n`);
  process.exit(exitCode);
}

function stripJsonCommentsAndTrailingCommas(source) {
  return String(source || "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/,\s*([}\]])/g, "$1");
}

function readJsonc(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    errors.push(`Missing ${rel}`);
    return null;
  }
  try {
    return JSON.parse(stripJsonCommentsAndTrailingCommas(fs.readFileSync(abs, "utf8")));
  } catch (error) {
    errors.push(`Invalid JSON/JSONC in ${rel}: ${error.message}`);
    return null;
  }
}

function runNode(args, env = {}) {
  const childEnv = { ...process.env, ...env };
  // Avoid npm/CI environment leakage forcing auto mode or hanging child checks.
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

function checkNodeSyntax(rel) {
  const result = runNode(["--check", rel]);
  if (result.status !== 0) errors.push(`Syntax check failed for ${rel}: ${result.stderr || result.stdout}`);
}

function checkConfig(rel, expectedPrefix) {
  const data = readJsonc(rel);
  if (!data) return;
  const template = String(data.sourceLinkTemplate || "");
  if (!template.startsWith(expectedPrefix)) {
    errors.push(`${rel} sourceLinkTemplate should start with ${expectedPrefix}, got ${template || "<empty>"}`);
  }
  if (!template.includes("{path}") || !template.includes("{line}")) {
    errors.push(`${rel} sourceLinkTemplate must include {path} and {line}.`);
  }
  if (/your-username|your-repo/i.test(template)) {
    errors.push(`${rel} still contains placeholder GitHub owner/repo text.`);
  }
  if (data.skipErrorChecking !== true) {
    warnings.push(`${rel} does not have skipErrorChecking=true. This is okay only for strict docs configs.`);
  }
}

for (const rel of [
  "typedoc.json",
  "typedoc-frontend.json",
  "typedoc-ci.json",
  "typedoc-strict.json",
  "tsconfig.doc.json",
  "package.json",
]) {
  readJsonc(rel);
}

for (const rel of [
  "scripts/typedoc-source-config.mjs",
  "scripts/typedoc-source-link-doctor.mjs",
  "scripts/typedoc-tool-health.mjs",
  "scripts/ai/typedoc-local-source-check.mjs",
]) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`Missing ${rel}`);
  else checkNodeSyntax(rel);
}

const pkg = readJsonc("package.json");
for (const scriptName of [
  "typedoc:health",
  "typedoc:doctor",
  "typedoc:json",
  "typedoc:json:local",
  "typedoc:json:github",
  "typedoc:check-local",
  "typedoc:strict",
]) {
  if (!pkg?.scripts?.[scriptName]) errors.push(`package.json missing script: ${scriptName}`);
}

const generationCases = [
  ["scripts/typedoc-source-config.mjs", "local", "typedoc.json"],
  ["scripts/typedoc-source-config.mjs", "github", "typedoc.json"],
  ["scripts/typedoc-source-config.mjs", "local", "typedoc-frontend.json"],
  ["scripts/typedoc-source-config.mjs", "github", "typedoc-frontend.json"],
];

for (const args of generationCases) {
  const isGithub = args[1] === "github";
  const result = runNode(
    args,
    isGithub ? { TYPEDOC_GITHUB_REPOSITORY: "example/repo", TYPEDOC_GITHUB_REVISION: "main" } : {}
  );
  if (result.status !== 0) {
    errors.push(`Failed node ${args.join(" ")}: ${result.stderr || result.stdout}`);
  } else {
    try {
      const parsed = JSON.parse(result.stdout);
      generated.push(parsed.output);
    } catch {
      warnings.push(`Could not parse generation stdout for ${args.join(" ")}`);
    }
  }
}

checkConfig("typedoc.local.generated.json", "vscode://file");
checkConfig("typedoc.github.generated.json", "https://github.com/example/repo/blob/main/");
checkConfig("typedoc-frontend.local.generated.json", "vscode://file");
checkConfig("typedoc-frontend.github.generated.json", "https://github.com/example/repo/blob/main/");

const typedocApi = path.join(root, "typedoc-api.json");
if (fs.existsSync(typedocApi)) {
  const result = runNode(["scripts/ai/typedoc-local-source-check.mjs"]);
  if (result.status !== 0) errors.push(`typedoc local source check failed: ${result.stderr || result.stdout}`);
} else {
  warnings.push("typedoc-api.json not found; skipped local JSON output check. Run npm run typedoc:json:local after npm install to validate generated API JSON.");
}

finish({
  ok: errors.length === 0,
  toolchain: "typedoc-hybrid-source-links",
  checkedScripts: [
    "scripts/typedoc-source-config.mjs",
    "scripts/typedoc-source-link-doctor.mjs",
    "scripts/typedoc-tool-health.mjs",
    "scripts/ai/typedoc-local-source-check.mjs",
  ],
  generated,
  errors,
  warnings,
  next: errors.length
    ? ["Fix listed TypeDoc tooling errors", "npm run typedoc:health"]
    : ["npm run typedoc:json:local", "npm run typedoc:check-local"],
}, errors.length ? 1 : 0);
