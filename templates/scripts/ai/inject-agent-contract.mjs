#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] || fallback) : fallback;
};

const target = path.resolve(arg("--target", "."));
const strict = args.includes("--strict");
const dryRun = args.includes("--dry-run");
const marker = "ai-code-intelligence-toolkit";
const agentContract = fs.readFileSync(path.join(__dirname, "AGENTS_SNIPPET.md"), "utf8");
const readmeContract = fs.readFileSync(path.join(__dirname, "README_SECTION.md"), "utf8");

function readText(file, fallback = "") {
  try { return fs.readFileSync(file, "utf8"); } catch { return fallback; }
}
function writeText(file, text) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function hasConflictMarkers(text) {
  return /^(<<<<<<<|=======|>>>>>>>)(?:\s|$)/m.test(text);
}
function lineStartAt(text, index) {
  const i = text.lastIndexOf("\n", Math.max(0, index - 1));
  return i < 0 ? 0 : i + 1;
}
function removeManagedMarkerBlock(text, blockMarker) {
  const start = `<!-- ${blockMarker}:start -->`;
  const end = `<!-- ${blockMarker}:end -->`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\\s*`, "g");
  return text.replace(pattern, "").trimEnd();
}
function removeLegacyGeneratedSection(text, headingText) {
  const headingRe = new RegExp(`^#{0,6}\\s*${escapeRegExp(headingText)}\\s*$`, "im");
  const match = headingRe.exec(text);
  if (!match) return text;
  const start = lineStartAt(text, match.index);
  // Legacy generated sections did not have reliable end markers and contain many ## subheadings.
  // Remove from the generated heading to EOF to avoid leaving broken conflict hunks behind.
  return text.slice(0, start).trimEnd();
}
function removeGeneratedConflictHunks(text) {
  const lines = text.split(/\r?\n/);
  const output = [];
  for (let i = 0; i < lines.length;) {
    if (!lines[i].startsWith("<<<<<<<")) { output.push(lines[i]); i++; continue; }
    const start = i;
    let end = i;
    while (end < lines.length && !lines[end].startsWith(">>>>>>>")) end++;
    if (end < lines.length) end++;
    const hunk = lines.slice(start, end).join("\n");
    if (/AI Code Intelligence Toolkit|ai-code-intelligence-toolkit|typedoc:json:local|ai:graph:build|allowedPatchFiles|suggestedEditFiles/i.test(hunk)) {
      i = end;
      continue;
    }
    output.push(...lines.slice(start, end));
    i = end;
  }
  return output.join("\n").trimEnd();
}
function stripKnownGeneratedSections(text) {
  let output = text;
  output = removeManagedMarkerBlock(output, marker);
  output = removeGeneratedConflictHunks(output);
  output = removeLegacyGeneratedSection(output, "AI Code Intelligence Toolkit Rules");
  output = removeLegacyGeneratedSection(output, "AI Code Intelligence Toolkit");
  return output.trimEnd();
}
function makeBlock(content) {
  return `<!-- ${marker}:start -->\n${content.trim()}\n<!-- ${marker}:end -->\n`;
}
function insertNearTop(text, block) {
  const trimmed = text.trimEnd();
  if (!trimmed) return block;
  const lines = trimmed.split(/\r?\n/);
  const first = lines[0]?.trim() || "";
  if (/^#\s+/.test(first) || /^Agent Instructions\s*$/i.test(first)) {
    const rest = lines.slice(1).join("\n").trimStart();
    return `${lines[0]}\n\n${block}${rest ? "\n" + rest : ""}`.trimEnd() + "\n";
  }
  return `${block}\n${trimmed}\n`;
}
function inject(file, content, fallbackTitle) {
  const filePath = path.join(target, file);
  const existedBefore = fs.existsSync(filePath);
  const before = readText(filePath, fallbackTitle ? `${fallbackTitle}\n` : "");
  const stripped = stripKnownGeneratedSections(before);
  const after = insertNearTop(stripped, makeBlock(content));
  const result = {
    file,
    existedBefore,
    changed: before !== after,
    conflictMarkersBefore: hasConflictMarkers(before),
    conflictMarkersAfter: hasConflictMarkers(after),
    removedLegacyOrCorruptContract: before !== stripped && !before.includes(`<!-- ${marker}:start -->`)
  };
  writeText(filePath, after);
  return result;
}

const results = [
  inject("AGENTS.md", agentContract, "# Agent Instructions"),
  inject("README.md", readmeContract, "# Project README")
];
const bad = results.filter((r) => r.conflictMarkersAfter).map((r) => r.file);
const response = {
  ok: bad.length === 0,
  tool: "ai-code-intelligence-toolkit",
  toolName: "AI Agent Contract Injector",
  action: dryRun ? "dry-run-inject-agent-contract" : "inject-agent-contract",
  target,
  results,
  editPermission: "The injected contract allows the AI coding agent to edit every necessary repository file after the anti-drift workflow completes.",
  warnings: bad.length ? [`Conflict markers remain in: ${bad.join(", ")}. Resolve them before AI-agent coding.`] : [],
  next: [
    "npm run typedoc:json:local && npm run ai:graph:build",
    "npm run ai:spec -- \"<task>\"",
    "npm run ai:preflight -- \"<task>\"",
    "npm run ai:graph:query -- \"<specific symbol/file/error/feature>\""
  ]
};
console.log(JSON.stringify(response, null, 2));
if (strict && bad.length) process.exitCode = 1;
