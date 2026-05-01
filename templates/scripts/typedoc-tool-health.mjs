#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "scripts/typedoc-source-config.mjs",
  "scripts/typedoc-source-link-doctor.mjs",
  "scripts/typedoc-tool-health.mjs",
  "scripts/ai/typedoc-local-source-check.mjs"
];
const generated = [
  "typedoc.local.generated.json",
  "typedoc.github.generated.json",
  "typedoc-frontend.local.generated.json",
  "typedoc-frontend.github.generated.json"
];
function exists(rel) { return fs.existsSync(path.resolve(root, rel)); }
function readJson(rel) { try { return JSON.parse(fs.readFileSync(path.resolve(root, rel), "utf8")); } catch { return null; } }
function collectSourceUrls(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) { for (const item of value) collectSourceUrls(item, out); return out; }
  if (value.url && typeof value.url === "string") out.push(value.url);
  if (Array.isArray(value.sources)) collectSourceUrls(value.sources, out);
  if (Array.isArray(value.signatures)) collectSourceUrls(value.signatures, out);
  if (Array.isArray(value.children)) collectSourceUrls(value.children, out);
  return out;
}
function isGithubBlob(url) { return /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\//i.test(url); }
const errors = [];
const warnings = [];
for (const rel of required) if (!exists(rel)) errors.push(`${rel} missing`);
for (const rel of generated) if (!exists(rel)) warnings.push(`${rel} not found yet; run typedoc config scripts when needed.`);
const typedoc = readJson("typedoc-api.json");
let githubBlobSourceUrlCount = 0;
if (typedoc) {
  githubBlobSourceUrlCount = collectSourceUrls(typedoc).filter(isGithubBlob).length;
  if (githubBlobSourceUrlCount > 0) errors.push("typedoc-api.json contains GitHub blob source URLs; regenerate with npm run typedoc:json:local.");
} else {
  warnings.push("typedoc-api.json not found; skipped local JSON output check. Run npm run typedoc:json:local after npm install to validate generated API JSON.");
}
const ok = errors.length === 0;
console.log(JSON.stringify({
  ok,
  toolchain: "typedoc-hybrid-source-links",
  checkedScripts: required,
  generated,
  errors,
  warnings,
  typedoc: { present: Boolean(typedoc), githubBlobSourceUrlCount },
  next: ok ? ["npm run typedoc:json:local", "npm run typedoc:check-local"] : []
}, null, 2));
process.exit(ok ? 0 : 1);
