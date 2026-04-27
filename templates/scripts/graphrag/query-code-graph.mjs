#!/usr/bin/env node
/**
 * Query local code graph.
 * Usage: node scripts/graphrag/query-code-graph.mjs "symbol or feature"
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const QUERY = process.argv.slice(2).join(" ").trim();
const GRAPH_PATH = path.join(ROOT, ".ai", "code-graph", "graph.json");

if (!QUERY) {
  console.error('Usage: node scripts/graphrag/query-code-graph.mjs "symbol or feature"');
  process.exit(1);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function normalize(s) {
  return String(s ?? "").toLowerCase();
}

function scoreNode(node, q) {
  const haystack = normalize([node.name, node.path, node.kind, node.type, node.source, node.targetPath].filter(Boolean).join(" "));
  const qn = normalize(q);
  if (!haystack) return 0;
  if (haystack === qn) return 100;
  if (haystack.includes(qn)) return 75;
  let score = 0;
  for (const part of qn.split(/[\s._/-]+/).filter(Boolean)) {
    if (haystack.includes(part)) score += 12;
  }
  return score;
}

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function lineReadCommand(file, line) {
  if (!file) return null;
  const safeLine = Number.isFinite(Number(line)) ? Math.max(1, Number(line)) : 1;
  const skip = Math.max(0, safeLine - 25);
  return `Get-Content -Path "${file}" | Select-Object -Skip ${skip} -First 80`;
}

const graph = readJson(GRAPH_PATH);
if (!graph) {
  console.log(JSON.stringify({
    ok: false,
    query: QUERY,
    error: "Graph index missing. Run: node scripts/graphrag/build-code-graph.mjs",
    fallback: [
      'Select-String -Path ".\\AI_GROUND_TRUTH.md" -Pattern "' + QUERY.replace(/"/g, '\\"') + '" -Context 2,4',
      "Search AI_SYMBOL_INDEX.json",
      "Then read only targeted files."
    ]
  }, null, 2));
  process.exit(2);
}

const nodes = graph.nodes ?? [];
const edges = graph.edges ?? [];

const directMatches = nodes
  .map((node) => ({ node, score: scoreNode(node, QUERY) }))
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 20);

const matchedIds = new Set(directMatches.map((x) => x.node.id));
const relatedEdges = edges.filter((edge) => matchedIds.has(edge.from) || matchedIds.has(edge.to));
const relatedIds = new Set(relatedEdges.flatMap((edge) => [edge.from, edge.to]));
const relatedNodes = nodes.filter((node) => relatedIds.has(node.id));

const relatedFiles = uniqueBy(
  relatedNodes
    .filter((node) => node.path || node.targetPath)
    .map((node) => ({
      type: node.type,
      name: node.name,
      path: node.path ?? node.targetPath,
      line: node.line ?? node.targetLine ?? null,
      readCommand: lineReadCommand(node.path ?? node.targetPath, node.line ?? node.targetLine)
    })),
  (x) => `${x.path}:${x.line ?? ""}`
).slice(0, 30);

const relatedSymbols = uniqueBy(
  relatedNodes
    .filter((node) => node.type === "symbol")
    .map((node) => ({ name: node.name, kind: node.kind ?? null, path: node.path ?? node.targetPath ?? null, line: node.line ?? node.targetLine ?? null })),
  (x) => `${x.name}:${x.path ?? ""}:${x.line ?? ""}`
).slice(0, 30);

const readCommands = uniqueBy(
  relatedFiles.map((item) => item.readCommand).filter(Boolean).map((command) => ({ command })),
  (x) => x.command
).map((x) => x.command);

const validationHints = [];
if (/trivia|question|cache|ai_questions|offline|mistral|groq/i.test(QUERY)) validationHints.push("node scripts/validate-trivia-live-contract.mjs");
if (/auth|login|rls|policy|supabase|rpc|database|table/i.test(QUERY)) validationHints.push("Run DB/RLS focused checks and inspect documentation/DB.md");
if (/ui|component|page|route|stage|guest|parent|family|admin/i.test(QUERY)) validationHints.push("Run relevant UI/runtime checks or Playwright checks if available");
validationHints.push("npm run typecheck", "npm run lint");

console.log(JSON.stringify({
  ok: true,
  query: QUERY,
  generatedAt: graph.generatedAt,
  matches: directMatches.map(({ node, score }) => ({
    score,
    type: node.type,
    name: node.name,
    kind: node.kind ?? null,
    path: node.path ?? node.targetPath ?? null,
    line: node.line ?? node.targetLine ?? null
  })),
  relatedFiles,
  relatedSymbols,
  relationships: relatedEdges.slice(0, 40),
  readCommands,
  validationHints: uniqueBy(validationHints.map((command) => ({ command })), (x) => x.command).map((x) => x.command)
}, null, 2));
process.exit(0);
