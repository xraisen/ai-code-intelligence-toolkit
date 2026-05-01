#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = process.argv.slice(2).length ? process.argv.slice(2) : ["typedoc-api.json", "typedoc-api.github.json"];

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(path.resolve(root, file), "utf8")); }
  catch { return null; }
}
function collectSourceUrls(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) collectSourceUrls(item, out);
    return out;
  }
  if (value.url && typeof value.url === "string") out.push(value.url);
  if (Array.isArray(value.sources)) collectSourceUrls(value.sources, out);
  if (Array.isArray(value.signatures)) collectSourceUrls(value.signatures, out);
  if (Array.isArray(value.children)) collectSourceUrls(value.children, out);
  return out;
}
function isLocal(url) { return /^vscode:\/\/file\//i.test(url); }
function isGithubBlob(url) { return /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\//i.test(url); }

const reports = [];
for (const file of files) {
  const json = readJson(file);
  if (!json) {
    reports.push({ file, present: false, sourceUrlCount: 0, localCount: 0, githubBlobCount: 0, ok: true, warning: "file not found; skipped" });
    continue;
  }
  const urls = collectSourceUrls(json);
  const localCount = urls.filter(isLocal).length;
  const githubBlobCount = urls.filter(isGithubBlob).length;
  const expected = file.includes("github") ? "github" : "local";
  reports.push({
    file,
    present: true,
    expected,
    sourceUrlCount: urls.length,
    localCount,
    githubBlobCount,
    ok: expected === "github" ? githubBlobCount > 0 && localCount === 0 : githubBlobCount === 0
  });
}
const ok = reports.every((r) => r.ok);
console.log(JSON.stringify({ ok, reports }, null, 2));
process.exit(ok ? 0 : 1);
