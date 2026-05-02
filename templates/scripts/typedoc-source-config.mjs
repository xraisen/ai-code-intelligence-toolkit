#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const modeArg = String(process.argv[2] || process.env.TYPEDOC_SOURCE_MODE || "auto").toLowerCase();
const inputConfig = process.argv[3] || "typedoc.json";
const root = process.cwd();

function readJson(file, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(path.resolve(root, file), "utf8")); }
  catch { return fallback; }
}
function writeJson(file, value) {
  fs.writeFileSync(path.resolve(root, file), JSON.stringify(value, null, 2) + "\n");
}
function run(cmd, args) {
  try { return execFileSync(cmd, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return ""; }
}
function normalizeSlash(value) { return String(value || "").replace(/\\/g, "/"); }
function existsDir(dir) { return fs.existsSync(path.resolve(root, dir)) && fs.statSync(path.resolve(root, dir)).isDirectory(); }
function unique(values) { return Array.from(new Set(values.filter(Boolean))); }

function repoSlugFromPackage() {
  const pkg = readJson("package.json", {});
  const raw = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url;
  if (!raw) return "";
  const cleaned = raw.replace(/^git\+/, "").replace(/\.git$/, "");
  const m = cleaned.match(/github\.com[:/]([^/]+\/[^/]+)$/i);
  return m ? m[1] : "";
}
function repoUrl() {
  const fromEnv = process.env.TYPEDOC_GITHUB_REPO || process.env.GITHUB_REPOSITORY || "";
  const slug = fromEnv.includes("/") ? fromEnv : repoSlugFromPackage();
  return slug ? `https://github.com/${slug.replace(/^https?:\/\/github\.com\//, "")}` : "https://github.com/OWNER/REPO";
}
function revision() {
  return process.env.TYPEDOC_GITHUB_REVISION || process.env.GITHUB_SHA || run("git", ["rev-parse", "HEAD"]) || "main";
}

function inferEntryPoints(config) {
  const existing = Array.isArray(config.entryPoints)
    ? config.entryPoints.map((value) => String(value).trim()).filter(Boolean)
    : [];
  if (existing.length) {
    return { changed: false, entryPoints: existing, fallbackUsed: false, reason: "preserved-config-entryPoints" };
  }

  const candidates = [];
  if (existsDir("src")) candidates.push("src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx");
  if (existsDir("api")) candidates.push("api/**/*.ts", "api/**/*.tsx", "api/**/*.mts", "api/**/*.mjs", "api/**/*.js");
  if (existsDir("scripts")) candidates.push("scripts/**/*.ts", "scripts/**/*.mts", "scripts/**/*.mjs", "scripts/**/*.js");
  if (existsDir("mcp")) candidates.push("mcp/**/*.ts", "mcp/**/*.mts", "mcp/**/*.mjs", "mcp/**/*.js");
  if (existsDir("bin")) candidates.push("bin/**/*.ts", "bin/**/*.mts", "bin/**/*.mjs", "bin/**/*.js");
  for (const dir of ["lib", "app", "pages", "components", "types"]) {
    if (existsDir(dir)) candidates.push(`${dir}/**/*.ts`, `${dir}/**/*.tsx`, `${dir}/**/*.js`, `${dir}/**/*.jsx`);
  }

  return {
    changed: true,
    entryPoints: unique(candidates.length ? candidates : ["**/*.{ts,tsx,mts,mjs,js,jsx}"]),
    fallbackUsed: true,
    reason: "inferred-glob-entryPoints"
  };
}
function defaultExclude() {
  return [
    "**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**", "**/out/**", "**/output/**",
    "**/.next/**", "**/.nuxt/**", "**/coverage/**", "**/docs/api*/**", "**/public/docs/**",
    "**/android/app/src/main/assets/public/**", "**/ios/App/App/public/**", "**/*generated*", "**/*.generated.*",
    "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx",
    "**/typedoc-api*.json", "**/package-lock.json", "**/pnpm-lock.yaml", "**/yarn.lock", "**/bun.lockb"
  ];
}
function outputName(mode, input) {
  const stem = path.basename(input, path.extname(input));
  return `${stem}.${mode}.generated.json`;
}
function publicOutDir(input) {
  return input.includes("frontend") ? "docs/api-frontend-github" : "docs/api-github";
}
function localOutDir(input) {
  return input.includes("frontend") ? "docs/api-frontend-local" : "docs/api-local";
}

const requestedMode = modeArg === "github" || modeArg === "local" ? modeArg : "auto";
const selectedMode = requestedMode === "auto" ? (process.env.CI || process.env.GITHUB_ACTIONS ? "github" : "local") : requestedMode;
const input = readJson(inputConfig, {});
const entryPointNormalization = inferEntryPoints(input);
const absoluteRoot = normalizeSlash(path.resolve(root));
const sourceLinkTemplate = selectedMode === "local"
  ? `vscode://file/${absoluteRoot}/{path}:{line}`
  : `${repoUrl()}/blob/${revision()}/{path}#L{line}`;

const generated = {
  ...input,
  entryPoints: entryPointNormalization.entryPoints,
  entryPointStrategy: input.entryPointStrategy || "expand",
  tsconfig: input.tsconfig || "tsconfig.doc.json",
  exclude: unique([...(Array.isArray(input.exclude) ? input.exclude : []), ...defaultExclude()]),
  sourceLinkTemplate,
  out: selectedMode === "github" ? publicOutDir(inputConfig) : localOutDir(inputConfig),
  skipErrorChecking: input.skipErrorChecking ?? true
};

const output = outputName(selectedMode, inputConfig);
writeJson(output, generated);
console.log(JSON.stringify({
  ok: true,
  requestedMode,
  selectedMode,
  input: inputConfig,
  output,
  outDir: generated.out,
  tsconfig: generated.tsconfig,
  entryPointStrategy: generated.entryPointStrategy,
  skipErrorChecking: generated.skipErrorChecking,
  sourceLinkTemplate,
  excludeCount: generated.exclude.length,
  entryPoints: generated.entryPoints,
  entryPointNormalization
}, null, 2));
