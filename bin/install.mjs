#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const arg = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? (args[i + 1] || fallback) : fallback; };
const target = path.resolve(arg("--target", "."));
const overwrite = args.includes("--overwrite");
const strict = args.includes("--strict");
const marker = "ai-code-intelligence-toolkit";

function copy(rel) { const src = path.join(pkgRoot, "templates", rel); const dst = path.join(target, rel); fs.mkdirSync(path.dirname(dst), { recursive: true }); const existed = fs.existsSync(dst); if (!overwrite && existed) return { file: rel, action: "preserved" }; fs.copyFileSync(src, dst); return { file: rel, action: existed ? "overwritten" : "created" }; }
function readJson(file, fallback = {}) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJson(file, obj) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n"); }
function readText(file, fallback = "") { try { return fs.readFileSync(file, "utf8"); } catch { return fallback; } }
function writeText(file, text) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function hasConflictMarkers(text) { return /^(<<<<<<<|=======|>>>>>>>)(?:\s|$)/m.test(text); }
function lineStartAt(text, index) { const i = text.lastIndexOf("\n", Math.max(0, index - 1)); return i < 0 ? 0 : i + 1; }
function removeManagedMarkerBlock(text, blockMarker) { const start = `<!-- ${blockMarker}:start -->`; const end = `<!-- ${blockMarker}:end -->`; return text.replace(new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\\s*`, "g"), "").trimEnd(); }
function removeLegacyGeneratedSection(text, headingText) { const headingRe = new RegExp(`^#{0,6}\\s*${escapeRegExp(headingText)}\\s*$`, "im"); const match = headingRe.exec(text); if (!match) return text; const start = lineStartAt(text, match.index); return text.slice(0, start).trimEnd(); }
function removeGeneratedConflictHunks(text) { const lines = text.split(/\r?\n/); const output = []; for (let i = 0; i < lines.length;) { if (!lines[i].startsWith("<<<<<<<")) { output.push(lines[i]); i++; continue; } const start = i; let end = i; while (end < lines.length && !lines[end].startsWith(">>>>>>>")) end++; if (end < lines.length) end++; const hunk = lines.slice(start, end).join("\n"); if (/AI Code Intelligence Toolkit|ai-code-intelligence-toolkit|typedoc:json:local|ai:graph:build|allowedPatchFiles|suggestedEditFiles/i.test(hunk)) { i = end; continue; } output.push(...lines.slice(start, end)); i = end; } return output.join("\n").trimEnd(); }
function stripKnownGeneratedSections(text) { let output = text; output = removeManagedMarkerBlock(output, marker); output = removeGeneratedConflictHunks(output); output = removeLegacyGeneratedSection(output, "AI Code Intelligence Toolkit Rules"); output = removeLegacyGeneratedSection(output, "AI Code Intelligence Toolkit"); return output.trimEnd(); }
function makeBlock(content) { return `<!-- ${marker}:start -->\n${content.trim()}\n<!-- ${marker}:end -->\n`; }
function insertNearTop(text, block) { const trimmed = text.trimEnd(); if (!trimmed) return block; const lines = trimmed.split(/\r?\n/); const first = lines[0]?.trim() || ""; if (/^#\s+/.test(first) || /^Agent Instructions\s*$/i.test(first)) { const rest = lines.slice(1).join("\n").trimStart(); return `${lines[0]}\n\n${block}${rest ? "\n" + rest : ""}`.trimEnd() + "\n"; } return `${block}\n${trimmed}\n`; }
function inject(file, content, fallbackTitle) { const filePath = path.join(target, file); const existedBefore = fs.existsSync(filePath); const before = readText(filePath, fallbackTitle ? `${fallbackTitle}\n` : ""); const stripped = stripKnownGeneratedSections(before); const after = insertNearTop(stripped, makeBlock(content)); writeText(filePath, after); return { file, existedBefore, changed: before !== after, conflictMarkersBefore: hasConflictMarkers(before), conflictMarkersAfter: hasConflictMarkers(after), removedLegacyOrCorruptContract: before !== stripped && !before.includes(`<!-- ${marker}:start -->`) }; }

const files = [
  "scripts/graphrag/build-code-graph.mjs", "scripts/graphrag/query-code-graph.mjs", "scripts/graphrag/doctor.mjs", "scripts/graphrag/check-no-leaks.mjs",
  "scripts/ai/spec-preflight.mjs", "scripts/ai/codex-preflight.mjs", "scripts/ai/graphrag-script-contract.mjs", "scripts/ai/inject-agent-contract.mjs", "scripts/ai/history-worklog.mjs", "scripts/ai/test-smart-runner.mjs", "scripts/ai/AGENTS_SNIPPET.md", "scripts/ai/README_SECTION.md",
  "mcp/codebase-intelligence-server.mjs", "scripts/typedoc-strict-runner.mjs", "scripts/typedoc-source-config.mjs", "scripts/typedoc-source-link-doctor.mjs", "scripts/typedoc-tool-health.mjs", "scripts/ai/typedoc-local-source-check.mjs",
  "typedoc.json", "typedoc-frontend.json", "typedoc-ci.json", "typedoc-strict.json", "tsconfig.doc.json", "types/typedoc-local-shims.d.ts"
];
const copied = files.map(copy);

// Seed durable AI changelog without clobbering existing history.
for (const rel of ["docs/ai-changelog/START_HERE.md", "docs/ai-changelog/history.index.json"]) {
  const src = path.join(pkgRoot, "templates", rel);
  const dst = path.join(target, rel);
  const existed = fs.existsSync(dst);
  if (!existed) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    copied.push({ file: rel, action: "created" });
  } else {
    copied.push({ file: rel, action: "preserved" });
  }
}

for (const rel of ["AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json"]) { const src = path.join(pkgRoot, "templates", rel); const dst = path.join(target, rel); const existed = fs.existsSync(dst); if (!existed || overwrite) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); copied.push({ file: rel, action: existed ? "overwritten" : "created" }); } else { copied.push({ file: rel, action: "preserved" }); } }
const pkgPath = path.join(target, "package.json");
const pkg = readJson(pkgPath, { scripts: {} });
pkg.scripts = { ...(pkg.scripts || {}), ...readJson(path.join(pkgRoot, "templates/package.scripts.json"), {}) };
writeJson(pkgPath, pkg);
const docs = [inject("AGENTS.md", readText(path.join(pkgRoot, "templates/AGENTS_SNIPPET.md")), "# Agent Instructions"), inject("README.md", readText(path.join(pkgRoot, "templates/README_SECTION.md")), "# Project README")];
const bad = docs.filter((d) => d.conflictMarkersAfter).map((d) => d.file);
console.log(JSON.stringify({ ok: bad.length === 0, tool: "ai-code-intelligence-toolkit", toolName: "AI Code Intelligence Installer", target, copied, scripts: { changed: Object.keys(readJson(path.join(pkgRoot, "templates/package.scripts.json"), {}) ) }, docs, extra: ["AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json"], editPermission: "Installed contract allows AI coding agents to edit every necessary file after the anti-drift workflow completes.", warnings: bad.length ? [`Conflict markers remain in: ${bad.join(", ")}. Resolve before AI-agent coding.`] : [], next: ["npm install", "npm run typedoc:health", "npm run typedoc:json:local && npm run ai:graph:build", "npm run ai:spec -- \"<task>\"", "npm run ai:preflight -- \"<task>\"", "npm run ai:graph:query -- \"<specific symbol/file/error/feature>\"", "npm run ai:history:init", "npm run ai:test:status", "npm run ai:final-health"] }, null, 2));
if (strict && bad.length) process.exitCode = 1;
