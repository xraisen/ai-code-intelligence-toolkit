#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const args = process.argv.slice(2);
const command = args[0] || "status";
const dir = path.join(root, "docs", "ai-changelog");
const indexPath = path.join(dir, "history.index.json");
const startPath = path.join(dir, "START_HERE.md");

function nowIso(){ return new Date().toISOString(); }
function slugify(value){ return String(value || "change").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "change"; }
function getFlag(name, fallback="") { const i = args.indexOf(name); return i >= 0 ? (args[i + 1] || fallback) : fallback; }
function readJson(file, fallback){ try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJson(file, obj){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n"); }
function readText(file, fallback=""){ try { return fs.readFileSync(file, "utf8"); } catch { return fallback; } }
function writeText(file, text){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
function listEntries(){ return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^\d{3,}-.*\.md$/.test(f)).sort() : []; }
function hashText(text){ return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16); }
function loadIndex(){
  const fallback = { schemaVersion: 1, generatedAt: nowIso(), purpose: "Durable AI coding change memory", entries: [] };
  const index = readJson(indexPath, fallback);
  if (!Array.isArray(index.entries)) index.entries = [];
  return index;
}
function refreshStartHere(index){
  const entries = index.entries || [];
  const rows = entries.map((e) => `| ${e.number} | [${e.title}](${e.file}) | ${e.task || ""} | ${e.status || "recorded"} | ${e.updatedAt || e.createdAt || ""} |`).join("\n") || "| - | - | - | - | - |";
  const jsonSummary = JSON.stringify({
    schemaVersion: index.schemaVersion || 1,
    generatedAt: nowIso(),
    totalEntries: entries.length,
    latest: entries.slice(-5).map((e) => ({ number: e.number, title: e.title, file: e.file, task: e.task, status: e.status }))
  }, null, 2);
  writeText(startPath, `# AI Changelog Start Here\n\nThis folder is durable project memory for AI coding agents. Read this file before reopening old bug areas or touching code that may already have been fixed.\n\n## Required anti-drift order\n\n1. Read \`AGENTS.md\`.\n2. Read this file: \`docs/ai-changelog/START_HERE.md\`.\n3. Check \`docs/ai-changelog/history.index.json\` for prior fixes.\n4. Run \`npm run typedoc:json:local && npm run ai:graph:build\`.\n5. Run \`npm run ai:spec -- \"<task>\"\`.\n6. Run \`npm run ai:preflight -- \"<task>\"\`.\n7. Run \`npm run ai:graph:query -- \"<specific symbol/file/error/feature>\"\`.\n\n## Token conservation rule\n\nDo not reread old full files. Use the index below, then use \`Select-String\` bounded context on exact files and symbols.\n\n## Machine-readable summary\n\n\`\`\`json\n${jsonSummary}\n\`\`\`\n\n## Entry index\n\n| # | File | Task | Status | Updated |\n|---:|---|---|---|---|\n${rows}\n`);
}
function init(){
  fs.mkdirSync(dir, { recursive: true });
  const index = loadIndex();
  index.generatedAt = nowIso();
  writeJson(indexPath, index);
  refreshStartHere(index);
  return { ok: true, command: "init", dir: path.relative(root, dir), files: [path.relative(root, startPath), path.relative(root, indexPath)] };
}
function refresh(){
  fs.mkdirSync(dir, { recursive: true });
  const index = loadIndex();
  const byFile = new Map((index.entries || []).map((e) => [e.file, e]));
  for (const file of listEntries()) {
    const full = path.join(dir, file);
    const text = readText(full);
    const title = /^#\s+(.+)$/m.exec(text)?.[1] || file.replace(/\.md$/, "");
    const number = Number(file.split("-")[0]);
    const existing = byFile.get(file) || {};
    byFile.set(file, { ...existing, number, title, file, hash: hashText(text), updatedAt: nowIso(), status: existing.status || "recorded" });
  }
  index.entries = Array.from(byFile.values()).sort((a,b) => Number(a.number) - Number(b.number));
  index.generatedAt = nowIso();
  writeJson(indexPath, index);
  refreshStartHere(index);
  return { ok: true, command: "refresh", entries: index.entries.length, startHere: path.relative(root, startPath) };
}
function add(){
  fs.mkdirSync(dir, { recursive: true });
  const task = getFlag("--task", args.slice(1).join(" ").trim() || "Unspecified task");
  const summary = getFlag("--summary", "No summary provided.");
  const files = getFlag("--files", "");
  const validation = getFlag("--validation", "");
  const status = getFlag("--status", "completed");
  const index = loadIndex();
  const nextNumber = Math.max(0, ...index.entries.map((e) => Number(e.number) || 0), ...listEntries().map((f) => Number(f.split("-")[0]) || 0)) + 1;
  const title = getFlag("--title", task);
  const file = `${String(nextNumber).padStart(3, "0")}-${slugify(title)}.md`;
  const relFile = path.posix.join("docs/ai-changelog", file);
  const body = `# ${title}\n\n## Machine summary\n\n\`\`\`json\n${JSON.stringify({ number: nextNumber, task, summary, files: files.split(",").map((x) => x.trim()).filter(Boolean), validation, status, createdAt: nowIso() }, null, 2)}\n\`\`\`\n\n## Task\n\n${task}\n\n## Summary\n\n${summary}\n\n## Files changed or inspected\n\n${files ? files.split(",").map((f) => `- ${f.trim()}`).join("\n") : "- Not specified"}\n\n## Validation\n\n${validation || "Not specified"}\n\n## Drift prevention note\n\nBefore reopening this area, check this entry and run the current anti-drift discovery loop instead of reverting to an older broken implementation.\n`;
  writeText(path.join(dir, file), body);
  const entry = { number: nextNumber, title, task, summary, file, path: relFile, status, createdAt: nowIso(), updatedAt: nowIso(), hash: hashText(body) };
  index.entries.push(entry);
  index.entries.sort((a,b) => Number(a.number) - Number(b.number));
  index.generatedAt = nowIso();
  writeJson(indexPath, index);
  refreshStartHere(index);
  return { ok: true, command: "add", entry };
}
function status(){
  const index = loadIndex();
  return { ok: true, command: "status", exists: fs.existsSync(indexPath), dir: path.relative(root, dir), entries: index.entries.length, latest: index.entries.slice(-5), next: ["npm run ai:history:add -- --task \"<task>\" --summary \"<what changed>\"", "npm run ai:history:refresh"] };
}
let result;
if (command === "init") result = init();
else if (command === "add") result = add();
else if (command === "refresh") result = refresh();
else if (command === "status") result = status();
else result = { ok: false, error: `Unknown history command: ${command}`, valid: ["init", "add", "refresh", "status"] };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
