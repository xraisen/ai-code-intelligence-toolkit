#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = process.argv[2] || "typedoc-api.json";
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
function isPlaceholder(url) { return /OWNER\/REPO|your-username|your-repo/i.test(url); }
const json = readJson(file);
if (!json) {
  console.log(JSON.stringify({ ok: true, file, present: false, warning: `${file} not found; run npm run typedoc:json:local after npm install.` }, null, 2));
  process.exit(0);
}
const urls = collectSourceUrls(json);
const githubBlobUrls = urls.filter(isGithubBlob);
const placeholders = urls.filter(isPlaceholder);
const ok = githubBlobUrls.length === 0 && placeholders.length === 0;
console.log(JSON.stringify({ ok, file, present: true, sourceUrlCount: urls.length, githubBlobSourceUrlCount: githubBlobUrls.length, placeholderSourceUrlCount: placeholders.length }, null, 2));
process.exit(ok ? 0 : 1);
