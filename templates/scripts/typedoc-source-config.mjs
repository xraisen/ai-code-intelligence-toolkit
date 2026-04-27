#!/usr/bin/env node
/**
 * Generates TypeDoc configs with source links that match where docs will be consumed.
 *
 * Modes:
 *   auto   -> local on a developer PC, github in CI/GitHub Actions, or env override
 *   local  -> VS Code file links into the current repo folder
 *   github -> GitHub blob links from git remote/env metadata
 *
 * Design decision:
 *   Generated docs configs default to doc-safe mode so TypeDoc can produce typedoc-api.json
 *   even when the app has unrelated strict TS errors. Use TYPEDOC_STRICT=true to preserve
 *   the base config's strict error checking.
 *
 * Env overrides:
 *   TYPEDOC_SOURCE_LINK_MODE=local|github
 *   TYPEDOC_PROJECT_ROOT=/absolute/path/to/repo
 *   TYPEDOC_GITHUB_REPOSITORY=owner/repo
 *   TYPEDOC_GITHUB_REVISION=main|branch|sha
 *   TYPEDOC_STRICT=true
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [, , modeArg = "auto", baseConfigArg = "typedoc.json"] = process.argv;
const requestedMode = modeArg.trim().toLowerCase();

if (!["auto", "local", "github"].includes(requestedMode)) {
  console.error("Usage: node scripts/typedoc-source-config.mjs <auto|local|github> [typedoc.json]");
  process.exit(1);
}

const cwd = process.cwd();
const baseConfigPath = path.resolve(cwd, baseConfigArg);

if (!fs.existsSync(baseConfigPath)) {
  console.error(`TypeDoc base config not found: ${baseConfigArg}`);
  process.exit(1);
}

function stripJsonCommentsAndTrailingCommas(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/,\s*([}\]])/g, "$1");
}

function readJsonc(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(stripJsonCommentsAndTrailingCommas(raw));
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function parseGithubRepository(remoteUrl) {
  const trimmed = remoteUrl.trim();

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/i);
  if (sshMatch) return sshMatch[1];

  const httpsMatch = trimmed.match(/^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:\/)?$/i);
  if (httpsMatch) return httpsMatch[1];

  const sshUrlMatch = trimmed.match(/^ssh:\/\/git@github\.com\/([^/]+\/[^/]+?)(?:\.git)?(?:\/)?$/i);
  if (sshUrlMatch) return sshUrlMatch[1];

  return "";
}

function normalizeVscodeRoot(projectRoot) {
  const normalized = path.resolve(projectRoot).replace(/\\/g, "/").replace(/\/+$/, "");

  // Windows: vscode://file/D:/repo/src/file.ts:10
  // POSIX:   vscode://file/home/user/repo/src/file.ts:10
  if (/^[A-Za-z]:\//.test(normalized)) return `vscode://file/${normalized}`;
  if (normalized.startsWith("/")) return `vscode://file${normalized}`;
  return `vscode://file/${normalized}`;
}

function resolveGithubRepositoryQuietly() {
  const fromEnv =
    process.env.TYPEDOC_GITHUB_REPOSITORY ||
    process.env.GITHUB_REPOSITORY ||
    process.env.REPOSITORY ||
    "";

  if (fromEnv && /^[^/\s]+\/[^/\s]+$/.test(fromEnv)) {
    return fromEnv.replace(/\.git$/i, "");
  }

  return parseGithubRepository(runGit(["remote", "get-url", "origin"]));
}

function selectMode() {
  const fromEnv = (process.env.TYPEDOC_SOURCE_LINK_MODE || "").trim().toLowerCase();
  if (["local", "github"].includes(fromEnv)) return fromEnv;
  if (requestedMode !== "auto") return requestedMode;

  if (process.env.GITHUB_ACTIONS === "true") return "github";
  if (process.env.CI === "true" && resolveGithubRepositoryQuietly()) return "github";

  return "local";
}

function getGithubRepository() {
  const fromEnv =
    process.env.TYPEDOC_GITHUB_REPOSITORY ||
    process.env.GITHUB_REPOSITORY ||
    process.env.REPOSITORY ||
    "";

  if (fromEnv && /^[^/\s]+\/[^/\s]+$/.test(fromEnv)) {
    return fromEnv.replace(/\.git$/i, "");
  }

  const parsed = parseGithubRepository(runGit(["remote", "get-url", "origin"]));
  if (parsed) return parsed;

  console.error(
    [
      "Cannot determine GitHub repository.",
      "Set TYPEDOC_GITHUB_REPOSITORY=owner/repo or configure git remote origin.",
      "Example:",
      "  TYPEDOC_GITHUB_REPOSITORY=your-org/your-repo npm run typedoc:html:github",
    ].join("\n")
  );
  process.exit(1);
}

function getGithubRevision() {
  const fromEnv =
    process.env.TYPEDOC_GITHUB_REVISION ||
    process.env.GITHUB_SHA ||
    process.env.COMMIT_SHA ||
    "";

  if (fromEnv) return fromEnv;

  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch && branch !== "HEAD") return branch;

  const sha = runGit(["rev-parse", "--verify", "HEAD"]);
  if (sha) return sha;

  return "main";
}

function generatedConfigName(configPath, selectedMode) {
  const parsed = path.parse(configPath);
  const suffix = requestedMode === "auto" ? "auto" : selectedMode;
  return path.join(parsed.dir, `${parsed.name}.${suffix}.generated${parsed.ext || ".json"}`);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function hardenForDocs(config) {
  const standardExcludes = [
    "**/__tests__/**",
    "**/__mocks__/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/node_modules/**",
    "node_modules/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "docs/**",
    "public/docs/**",
    ".ai/code-graph/**",
  ];

  config.exclude = unique([...(Array.isArray(config.exclude) ? config.exclude : []), ...standardExcludes]);

  config.validation = {
    ...(config.validation || {}),
    invalidLink: false,
    notExported: false,
  };

  // TypeDoc is a documentation generator. It should not be the strict app typecheck gate.
  // Keep `npm run typecheck` and repo validators as the source of truth for strict health.
  if ((process.env.TYPEDOC_STRICT || "").toLowerCase() !== "true") {
    config.skipErrorChecking = true;
  }

  config.excludeExternals = config.excludeExternals ?? true;
  config.cleanOutputDir = config.cleanOutputDir ?? true;
  config.disableSources = false;
}

const selectedMode = selectMode();
const config = readJsonc(baseConfigPath);
const baseName = path.basename(baseConfigPath);
const isFrontendConfig = baseName.includes("frontend");

hardenForDocs(config);

if (selectedMode === "local") {
  const projectRoot = path.resolve(process.env.TYPEDOC_PROJECT_ROOT || cwd);
  const vscodeRoot = normalizeVscodeRoot(projectRoot);
  config.out = isFrontendConfig ? "docs/api-frontend-local" : "docs/api-local";
  config.sourceLinkTemplate = `${vscodeRoot}/{path}:{line}`;
}

if (selectedMode === "github") {
  const repository = getGithubRepository();
  const revision = getGithubRevision();
  config.out = isFrontendConfig ? "docs/api-frontend-github" : "docs/api-github";
  config.sourceLinkTemplate = `https://github.com/${repository}/blob/${revision}/{path}#L{line}`;
}

config.sidebarLinks = {
  ...(config.sidebarLinks || {}),
  "API Local": isFrontendConfig ? "/docs/api-frontend-local/" : "/docs/api-local/",
  "API GitHub": isFrontendConfig ? "/docs/api-frontend-github/" : "/docs/api-github/",
};

const outputPath = generatedConfigName(baseConfigPath, selectedMode);
fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      ok: true,
      requestedMode,
      selectedMode,
      input: path.relative(cwd, baseConfigPath),
      output: path.relative(cwd, outputPath),
      outDir: config.out,
      skipErrorChecking: config.skipErrorChecking,
      sourceLinkTemplate: config.sourceLinkTemplate,
      excludeCount: config.exclude?.length ?? 0,
    },
    null,
    2
  )
);
