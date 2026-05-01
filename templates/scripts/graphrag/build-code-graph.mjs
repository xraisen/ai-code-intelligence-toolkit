#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const mode = args.has("--full") ? "full" : args.has("--minimal") ? "minimal" : "fast";
const includeTests = args.has("--include-tests") || mode === "full";
const start = Date.now();
const outFile = path.resolve(root, ".ai/code-graph/graph.json");
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts"]);
const DOC_EXTENSIONS = new Set([".md", ".mdx"]);
const EXTRA_EXTENSIONS = new Set([".json", ".sql", ".yml", ".yaml"]);
const IGNORE_DIRS = new Set([".git", "node_modules", "dist", "build", "out", "output", ".next", ".nuxt", ".svelte-kit", "coverage", ".turbo", ".cache", ".expo", ".gradle", "vendor"]);
const IGNORE_PATH_PARTS = ["docs/api", "docs/api-local", "docs/api-github", "docs/api-frontend", "public/docs", "android/app/src/main/assets/public", "ios/App/App/public", "documentation/archive", "supabase/migrations/_archive"];
const GENERATED_OR_HEAVY_FILE = /(^|\/)(?:typedoc-api(?:\.[^.\/]+)?\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|npm-shrinkwrap\.json|repomix-output.*|coverage-final\.json|.*\.generated\..*|.*generated.*\.csv)$/i;
const TEST_PATTERN = /(^|\/)(?:__tests__|tests?|e2e)(\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/i;
function toPosix(p) { return p.split(path.sep).join("/"); }
function isIgnored(rel) {
  const posix = toPosix(rel);
  if (GENERATED_OR_HEAVY_FILE.test(posix)) return true;
  if (!includeTests && TEST_PATTERN.test(posix)) return true;
  if (IGNORE_PATH_PARTS.some((part) => posix.includes(part))) return true;
  return posix.split("/").some((part) => IGNORE_DIRS.has(part));
}
function allowedExt(file) {
  const ext = path.extname(file).toLowerCase();
  if (SOURCE_EXTENSIONS.has(ext) || DOC_EXTENSIONS.has(ext)) return true;
  if (mode === "full" && EXTRA_EXTENSIONS.has(ext)) return true;
  return false;
}
function walk(dir, files=[]) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs);
    if (isIgnored(rel)) continue;
    if (entry.isDirectory()) walk(abs, files);
    else if (entry.isFile() && allowedExt(abs)) files.push(rel);
  }
  return files;
}
function read(file) { try { return fs.readFileSync(path.resolve(root, file), "utf8"); } catch { return ""; } }
function hash(text) { return crypto.createHash("sha1").update(text).digest("hex").slice(0, 12); }
function lineOf(text, index) { return text.slice(0, index).split(/\r?\n/).length; }
function roleForPath(rel) {
  const p = toPosix(rel);
  if (TEST_PATTERN.test(p)) return "test_contract";
  if (p === "src/types/index.ts" || p.includes("/types/")) return "type_contract";
  if (p.endsWith(".md") || p.endsWith(".mdx")) return "source_of_truth_doc";
  if (p.includes("supabase/functions/")) return "edge_function";
  if (p.includes("supabase/migrations/")) return "database_contract";
  if (p.includes("/scripts/validation/")) return "validation_script";
  if (p.includes("/scripts/") || p.startsWith("scripts/")) return "tooling_script";
  if (p.includes("/hooks/")) return "hook";
  if (p.includes("/components/")) return "implementation";
  if (p.includes("/pages/") || p.includes("/app/")) return "route_or_page";
  return "implementation";
}
function extractSymbols(rel, text) {
  const nodes = [];
  const p = toPosix(rel);
  const patterns = [
    ["function", /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g],
    ["class", /(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g],
    ["const", /(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=/g],
    ["type", /(?:export\s+)?(?:type|interface)\s+([A-Za-z_$][\w$]*)/g]
  ];
  for (const [kind, re] of patterns) {
    for (const m of text.matchAll(re)) {
      nodes.push({ id: `${p}#${kind}:${m[1]}`, kind, name: m[1], path: p, line: lineOf(text, m.index || 0), role: roleForPath(p) });
    }
  }
  if (nodes.length === 0) nodes.push({ id: p, kind: "file", name: path.basename(p), path: p, line: 1, role: roleForPath(p) });
  return nodes;
}
function extractEdges(rel, text) {
  const edges = [];
  const from = toPosix(rel);
  const importRe = /(?:import|export)\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']|require\(["']([^"']+)["']\)/g;
  for (const m of text.matchAll(importRe)) {
    const spec = m[1] || m[2];
    if (spec && spec.startsWith(".")) edges.push({ from, to: spec, kind: "imports", line: lineOf(text, m.index || 0) });
  }
  const mdRe = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const m of text.matchAll(mdRe)) {
    const spec = m[1];
    if (spec && !/^https?:/i.test(spec)) edges.push({ from, to: spec.split("#")[0], kind: "links", line: lineOf(text, m.index || 0) });
  }
  return edges;
}
const files = walk(root).map(toPosix).sort();
const nodes = [];
const edges = [];
const fileSummaries = [];
for (const file of files) {
  const text = read(file);
  const fileNode = { id: file, kind: "file", name: path.basename(file), path: file, line: 1, role: roleForPath(file), bytes: Buffer.byteLength(text), sha1: hash(text) };
  nodes.push(fileNode, ...extractSymbols(file, text));
  edges.push(...extractEdges(file, text));
  fileSummaries.push({ path: file, role: fileNode.role, bytes: fileNode.bytes, sha1: fileNode.sha1 });
}
const graph = { version: "1.0.6", mode, generatedAt: new Date().toISOString(), root: toPosix(root), filesProcessed: files.length, sourceFilesIndexed: files.filter((f) => SOURCE_EXTENSIONS.has(path.extname(f).toLowerCase())).length, nodes, edges, files: fileSummaries };
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(graph, null, 2) + "\n");
console.log(JSON.stringify({ phase: "ai:graph:build", mode, elapsedMs: Date.now()-start, timedOut: false, output: ".ai/code-graph/graph.json", filesProcessed: graph.filesProcessed, sourceFilesIndexed: graph.sourceFilesIndexed, nodeCount: nodes.length, edgeCount: edges.length }, null, 2));
