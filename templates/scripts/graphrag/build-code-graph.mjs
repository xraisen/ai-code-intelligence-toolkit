#!/usr/bin/env node
/**
 * Local GraphRAG-style code graph builder.
 * Zero external dependencies.
 *
 * Performance-safe default mode for large React/Supabase repos.
 *
 * Builds:
 * - .ai/code-graph/graph.json
 * - .ai/code-graph/nodes.json
 * - .ai/code-graph/edges.json
 * - .ai/code-graph/summary.md
 *
 * Modes:
 * - default / --fast: bounded scan, excludes tests, generated docs, build output, huge files
 * - --full: larger limits and includes test linking work; still excludes generated/heavy folders
 * - --minimal / --no-references: fastest graph; skips probable call/reference token indexing
 *
 * Optional env overrides:
 * - AI_GRAPH_MAX_FILES=2500
 * - AI_GRAPH_MAX_FILE_BYTES=300000
 * - AI_GRAPH_INCLUDE_TESTS=1
 * - AI_GRAPH_TIMEOUT_MS=90000
 * - AI_GRAPH_PROGRESS=0
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, ".ai", "code-graph");
const ARGS = new Set(process.argv.slice(2));

const MODE = ARGS.has("--full")
  ? "full"
  : ARGS.has("--minimal") || ARGS.has("--no-references")
    ? "minimal"
    : "fast";

function envInt(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return !["0", "false", "no", "off"].includes(String(raw).toLowerCase());
}

const INCLUDE_TESTS = ARGS.has("--include-tests") || envBool("AI_GRAPH_INCLUDE_TESTS", MODE === "full");
const ENABLE_REFERENCE_INDEX = MODE !== "minimal" && !ARGS.has("--skip-reference-index") && envBool("AI_GRAPH_REFERENCE_INDEX", true);
const MAX_FILES = envInt("AI_GRAPH_MAX_FILES", MODE === "full" ? 8000 : MODE === "minimal" ? 1200 : 2500);
const MAX_FILE_BYTES = envInt("AI_GRAPH_MAX_FILE_BYTES", MODE === "full" ? 1_500_000 : 350_000);
const MAX_SOURCE_INDEX_FILES = envInt("AI_GRAPH_MAX_SOURCE_INDEX_FILES", MODE === "full" ? 4000 : 1200);
const MAX_SYMBOLS_FOR_REFERENCES = envInt("AI_GRAPH_MAX_SYMBOLS_FOR_REFERENCES", MODE === "full" ? 8000 : 2500);
const MAX_REFERENCE_EDGES_PER_SYMBOL = envInt("AI_GRAPH_MAX_REFERENCE_EDGES_PER_SYMBOL", MODE === "full" ? 50 : 15);
const MAX_TOTAL_REFERENCE_EDGES = envInt("AI_GRAPH_MAX_TOTAL_REFERENCE_EDGES", MODE === "full" ? 120_000 : 35_000);
const TIMEOUT_MS = envInt("AI_GRAPH_TIMEOUT_MS", MODE === "full" ? 240_000 : 90_000);
const PROGRESS = envBool("AI_GRAPH_PROGRESS", true);
const PROGRESS_EVERY = envInt("AI_GRAPH_PROGRESS_EVERY", 250);
const STARTED_AT = Date.now();
let timedOut = false;

const EXCLUDED_DIRS = new Set([
  ".git",
  ".hg",
  ".svn",
  ".idea",
  ".vscode",
  "node_modules",
  "dist",
  "build",
  "out",
  "output",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".vite",
  ".vercel",
  ".netlify",
  ".output",
  "coverage",
  ".nyc_output",
  ".turbo",
  ".cache",
  ".parcel-cache",
  "playwright-report",
  "test-results",
  "blob-report",
  ".ai/code-graph",
  "docs/api",
  "docs/api-local",
  "docs/api-github",
  "docs/api-frontend",
  "docs/api-frontend-local",
  "docs/api-frontend-github",
  "public/docs",
  "android/app/src/main/assets/public",
  "ios/App/App/public",
  "documentation/archive",
  "supabase/migrations/_archive",
  "android/.gradle",
  "android/app/build",
  "android/build",
  "ios/Pods",
  "ios/App/build"
]);

const INCLUDED_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".sql", ".yml", ".yaml"
]);

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const DOC_EXTENSIONS = new Set([".md"]);
const TEST_PATTERN = /(^|\/)(?:__tests__|tests?|e2e)(\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/i;
const GENERATED_OR_HEAVY_FILE = /(^|\/)(?:typedoc-api(?:\.[^.\/]+)?\.json|typedoc(?:-frontend)?\.(?:auto|local|github)\.generated\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|npm-shrinkwrap\.json|repomix-output.*|coverage-final\.json|.*\.tsbuildinfo)$/i;
const COMMON_SYMBOLS = new Set([
  "React", "Error", "Response", "Request", "Date", "String", "Number", "Boolean", "Array", "Object", "Promise",
  "Map", "Set", "Record", "unknown", "undefined", "data", "error", "props", "state", "children", "index", "main",
  "handler", "config", "options", "result", "value", "event", "type", "id", "name"
]);

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function hash(input) {
  return crypto.createHash("sha1").update(input).digest("hex").slice(0, 12);
}

function nodeId(type, name) {
  return `${type}:${hash(name)}:${name}`.replace(/\s+/g, "_").slice(0, 240);
}

function elapsedMs() {
  return Date.now() - STARTED_AT;
}

function reachedDeadline() {
  if (elapsedMs() <= TIMEOUT_MS) return false;
  timedOut = true;
  return true;
}

function logProgress(message, extra = {}) {
  if (!PROGRESS) return;
  console.error(JSON.stringify({ phase: "ai:graph:build", mode: MODE, elapsedMs: elapsedMs(), message, ...extra }));
}

function shouldSkipDir(absPath) {
  const rel = toPosix(path.relative(ROOT, absPath));
  if (!rel) return false;
  if (EXCLUDED_DIRS.has(rel)) return true;
  return rel.split("/").some((part, index, parts) => {
    const prefix = parts.slice(0, index + 1).join("/");
    return EXCLUDED_DIRS.has(part) || EXCLUDED_DIRS.has(prefix);
  });
}

function shouldSkipFile(absPath, direntName) {
  const rel = toPosix(path.relative(ROOT, absPath));
  if (!INCLUDE_TESTS && TEST_PATTERN.test(rel)) return true;
  if (GENERATED_OR_HEAVY_FILE.test(rel) || GENERATED_OR_HEAVY_FILE.test(direntName)) return true;
  const ext = path.extname(direntName);
  return !INCLUDED_EXTENSIONS.has(ext);
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir) || acc.length >= MAX_FILES || reachedDeadline()) return acc;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }

  entries.sort((a, b) => {
    const ap = a.isDirectory() ? 0 : 1;
    const bp = b.isDirectory() ? 0 : 1;
    return ap - bp || a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    if (acc.length >= MAX_FILES || reachedDeadline()) break;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!shouldSkipDir(abs)) walk(abs, acc);
      continue;
    }
    if (!entry.isFile() || shouldSkipFile(abs, entry.name)) continue;
    try {
      const stat = fs.statSync(abs);
      if (stat.size > MAX_FILE_BYTES) continue;
    } catch {
      continue;
    }
    acc.push(abs);
    if (acc.length % PROGRESS_EVERY === 0) logProgress("scanned-files", { files: acc.length });
  }
  return acc;
}

function safeRead(file) {
  try {
    const stat = fs.statSync(file);
    if (stat.size > MAX_FILE_BYTES) return "";
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function lineOf(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function addNode(nodes, node) {
  if (!nodes.has(node.id)) nodes.set(node.id, node);
}

function addEdge(edges, edge) {
  const key = `${edge.from}|${edge.type}|${edge.to}|${edge.line ?? ""}`;
  if (!edges.has(key)) edges.set(key, edge);
}

function extractImports(content) {
  const imports = [];
  const patterns = [
    /import\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g,
    /export\s+[^'";]*?\s+from\s+["']([^"']+)["']/g,
    /require\(["']([^"']+)["']\)/g,
    /import\(["']([^"']+)["']\)/g
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content))) imports.push({ target: match[1], line: lineOf(content, match.index) });
  }
  return imports;
}

function extractSymbols(content) {
  const symbols = [];
  const patterns = [
    { kind: "function", regex: /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g },
    { kind: "function", regex: /(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g },
    { kind: "const", regex: /export\s+const\s+([A-Za-z_$][\w$]*)/g },
    { kind: "let", regex: /export\s+let\s+([A-Za-z_$][\w$]*)/g },
    { kind: "class", regex: /export\s+class\s+([A-Za-z_$][\w$]*)/g },
    { kind: "class", regex: /(?:^|\n)\s*class\s+([A-Za-z_$][\w$]*)/g },
    { kind: "interface", regex: /export\s+interface\s+([A-Za-z_$][\w$]*)/g },
    { kind: "type", regex: /export\s+type\s+([A-Za-z_$][\w$]*)/g },
    { kind: "enum", regex: /export\s+enum\s+([A-Za-z_$][\w$]*)/g },
    { kind: "react_component", regex: /export\s+default\s+function\s+([A-Z][A-Za-z0-9_$]*)/g },
    { kind: "react_component", regex: /const\s+([A-Z][A-Za-z0-9_$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g }
  ];
  for (const { kind, regex } of patterns) {
    let match;
    while ((match = regex.exec(content))) {
      symbols.push({ name: match[1], kind, line: lineOf(content, match.index), exported: /export/.test(match[0]) });
    }
  }
  return symbols;
}

function extractReferences(content) {
  const refs = [];
  const dbPatterns = [
    /(?:from|insert|update|delete|upsert)\(["'`]([A-Za-z0-9_]+)["'`]\)/g,
    /\bfrom\s+["'`]?([A-Za-z0-9_]+)["'`]?/gi,
    /\binto\s+["'`]?([A-Za-z0-9_]+)["'`]?/gi
  ];
  for (const pattern of dbPatterns) {
    for (const m of content.matchAll(pattern)) refs.push({ type: "database_reference", name: m[1], line: lineOf(content, m.index ?? 0) });
  }
  for (const m of content.matchAll(/\.rpc\(["'`]([A-Za-z0-9_]+)["'`]/g)) refs.push({ type: "rpc_reference", name: m[1], line: lineOf(content, m.index ?? 0) });
  for (const m of content.matchAll(/supabase\/functions\/v1\/([A-Za-z0-9_-]+)/g)) refs.push({ type: "edge_function_reference", name: m[1], line: lineOf(content, m.index ?? 0) });
  for (const m of content.matchAll(/(?:route|path|href|to):?\s*["'`]((?:\/[A-Za-z0-9_\-{}:]+)+)["'`]/g)) refs.push({ type: "route_reference", name: m[1], line: lineOf(content, m.index ?? 0) });
  return refs;
}

function classifyFile(rel, ext, content) {
  if (TEST_PATTERN.test(rel)) return "test";
  if (DOC_EXTENSIONS.has(ext)) return "doc";
  if (rel.includes("scripts/")) return "script";
  if ([".json", ".yml", ".yaml"].includes(ext)) return "config";
  if (/create table|alter table|policy|rpc|supabase/i.test(content)) return "database_reference";
  return "file";
}

function readJsonIfExists(file) {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function collectGroundTruth(nodes, edges) {
  const gtPath = path.join(ROOT, "AI_GROUND_TRUTH.md");
  if (!fs.existsSync(gtPath)) return;
  const rel = "AI_GROUND_TRUTH.md";
  const fileNode = { id: nodeId("doc", rel), type: "doc", name: rel, path: rel, role: "ground_truth" };
  addNode(nodes, fileNode);
  const content = safeRead(gtPath);
  const rx = /([A-Za-z_$][\w$.-]+).*?((?:src|app|lib|components|hooks|utils|server|supabase|pages|routes|documentation|scripts|mcp)[^\s:`'"()]+):?(\d+)?/g;
  for (const m of content.matchAll(rx)) {
    const symbolNode = {
      id: nodeId("symbol", m[1]), type: "symbol", name: m[1], kind: "ground_truth_symbol",
      source: rel, targetPath: m[2], targetLine: m[3] ? Number(m[3]) : null
    };
    addNode(nodes, symbolNode);
    addEdge(edges, { from: symbolNode.id, to: fileNode.id, type: "documented_by_probable", evidence: rel });
  }
}

function collectSymbolIndex(nodes, edges) {
  const idx = readJsonIfExists(path.join(ROOT, "AI_SYMBOL_INDEX.json"));
  if (!idx) return;
  const rel = "AI_SYMBOL_INDEX.json";
  const indexNode = { id: nodeId("config", rel), type: "config", name: rel, path: rel, role: "symbol_index" };
  addNode(nodes, indexNode);
  const text = JSON.stringify(idx);
  const seen = new Set();
  for (const m of text.matchAll(/"name"\s*:\s*"([^"]+)"/g)) {
    const name = m[1];
    if (seen.has(name)) continue;
    seen.add(name);
    const symNode = { id: nodeId("symbol", name), type: "symbol", name, kind: "indexed_symbol", source: rel };
    addNode(nodes, symNode);
    addEdge(edges, { from: symNode.id, to: indexNode.id, type: "documented_by_probable", evidence: rel });
  }
}

function tokenizeIdentifierMentions(content) {
  const tokens = new Set();
  const regex = /\b[A-Za-z_$][\w$]{2,}\b/g;
  let match;
  while ((match = regex.exec(content))) {
    const token = match[0];
    if (!COMMON_SYMBOLS.has(token)) tokens.add(token);
  }
  return tokens;
}

function buildMentionIndex(sourceRecords) {
  const mentionIndex = new Map();
  const indexed = sourceRecords.slice(0, MAX_SOURCE_INDEX_FILES);
  let done = 0;
  for (const record of indexed) {
    if (reachedDeadline()) break;
    const tokens = tokenizeIdentifierMentions(record.content);
    for (const token of tokens) {
      let list = mentionIndex.get(token);
      if (!list) {
        list = [];
        mentionIndex.set(token, list);
      }
      if (list.length < MAX_REFERENCE_EDGES_PER_SYMBOL * 3) list.push(record);
    }
    done += 1;
    if (done % PROGRESS_EVERY === 0) logProgress("indexed-source-mentions", { indexedFiles: done, tokens: mentionIndex.size });
  }
  return mentionIndex;
}

function addProbableReferenceEdges({ symbolNodes, mentionIndex, edges }) {
  let symbolCount = 0;
  let edgeCount = 0;
  for (const sym of symbolNodes) {
    if (reachedDeadline() || symbolCount >= MAX_SYMBOLS_FOR_REFERENCES || edgeCount >= MAX_TOTAL_REFERENCE_EDGES) break;
    if (!sym.name || !/^[A-Za-z_$][\w$]{2,}$/.test(sym.name) || COMMON_SYMBOLS.has(sym.name)) continue;
    const candidates = mentionIndex.get(sym.name);
    if (!candidates || candidates.length === 0) continue;
    let addedForSymbol = 0;
    for (const record of candidates) {
      if (edgeCount >= MAX_TOTAL_REFERENCE_EDGES || addedForSymbol >= MAX_REFERENCE_EDGES_PER_SYMBOL) break;
      if (sym.path && record.rel === sym.path) continue;
      const matchIndex = record.content.indexOf(sym.name);
      if (matchIndex < 0) continue;
      addEdge(edges, {
        from: record.fileNode.id,
        to: sym.id,
        type: "calls_probable",
        line: lineOf(record.content, matchIndex),
        evidence: record.rel
      });
      edgeCount += 1;
      addedForSymbol += 1;
    }
    symbolCount += 1;
    if (symbolCount % PROGRESS_EVERY === 0) logProgress("linked-probable-references", { symbolCount, referenceEdges: edgeCount });
  }
  return { symbolCount, edgeCount };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  logProgress("start", { root: ROOT, maxFiles: MAX_FILES, maxFileBytes: MAX_FILE_BYTES, includeTests: INCLUDE_TESTS });

  const nodes = new Map();
  const edges = new Map();
  const files = walk(ROOT);
  const fileRecords = [];
  const sourceRecords = [];
  let skippedEmptyOrLarge = 0;

  logProgress("walk-complete", { files: files.length, timedOut });

  for (let i = 0; i < files.length; i += 1) {
    if (reachedDeadline()) break;
    const abs = files[i];
    const rel = toPosix(path.relative(ROOT, abs));
    const ext = path.extname(abs);
    const content = safeRead(abs);
    if (!content) skippedEmptyOrLarge += 1;
    const type = classifyFile(rel, ext, content);
    const fileNode = { id: nodeId(type, rel), type, name: path.basename(rel), path: rel, extension: ext, lines: content ? content.split(/\r?\n/).length : 0 };
    addNode(nodes, fileNode);
    const record = { abs, rel, ext, content, type, fileNode };
    fileRecords.push(record);

    if (SOURCE_EXTENSIONS.has(ext)) {
      sourceRecords.push(record);
      for (const imp of extractImports(content)) {
        const importNode = { id: nodeId("symbol", imp.target), type: "symbol", name: imp.target, kind: "import_target" };
        addNode(nodes, importNode);
        addEdge(edges, { from: fileNode.id, to: importNode.id, type: "imports", line: imp.line, evidence: rel });
      }
      for (const sym of extractSymbols(content)) {
        const symNode = { id: nodeId("symbol", `${rel}:${sym.name}`), type: "symbol", name: sym.name, kind: sym.kind, path: rel, line: sym.line, exported: sym.exported };
        addNode(nodes, symNode);
        addEdge(edges, { from: symNode.id, to: fileNode.id, type: "located_in", line: sym.line, evidence: rel });
        if (sym.exported) addEdge(edges, { from: fileNode.id, to: symNode.id, type: "exports", line: sym.line, evidence: rel });
      }
    }

    for (const ref of extractReferences(content)) {
      const refNode = { id: nodeId(ref.type, ref.name), type: ref.type, name: ref.name };
      addNode(nodes, refNode);
      const typeName = ref.type === "database_reference"
        ? "references_database"
        : ref.type === "rpc_reference"
          ? "references_rpc"
          : ref.type === "edge_function_reference"
            ? "references_edge_function"
            : "related_to";
      addEdge(edges, { from: fileNode.id, to: refNode.id, type: typeName, line: ref.line, evidence: rel });
    }

    if ((i + 1) % PROGRESS_EVERY === 0) logProgress("processed-files", { processed: i + 1, nodes: nodes.size, edges: edges.size });
  }

  collectGroundTruth(nodes, edges);
  collectSymbolIndex(nodes, edges);

  const allNodesBeforeReferenceIndex = [...nodes.values()];
  const fileNodes = allNodesBeforeReferenceIndex.filter((n) => n.type === "file" || n.type === "script" || n.type === "database_reference");
  const testNodes = allNodesBeforeReferenceIndex.filter((n) => n.type === "test");
  const docNodes = allNodesBeforeReferenceIndex.filter((n) => n.type === "doc");

  if (INCLUDE_TESTS) {
    for (const file of fileNodes) {
      if (reachedDeadline()) break;
      const baseName = path.basename(file.path ?? "", path.extname(file.path ?? "")).toLowerCase();
      if (!baseName || baseName.length < 4) continue;
      for (const test of testNodes) {
        const testBase = path.basename(test.path ?? "", path.extname(test.path ?? "")).toLowerCase().replace(/\.(test|spec)$/i, "");
        if (testBase && (testBase.includes(baseName) || baseName.includes(testBase))) addEdge(edges, { from: file.id, to: test.id, type: "tested_by_probable", evidence: `${file.path} ↔ ${test.path}` });
      }
    }
  }

  for (const file of fileNodes) {
    if (reachedDeadline()) break;
    const baseName = path.basename(file.path ?? "", path.extname(file.path ?? "")).toLowerCase();
    if (!baseName || baseName.length < 4) continue;
    for (const doc of docNodes) {
      const docName = (doc.path ?? "").toLowerCase();
      if (docName.includes(baseName)) addEdge(edges, { from: file.id, to: doc.id, type: "documented_by_probable", evidence: `${file.path} ↔ ${doc.path}` });
    }
  }

  let referenceIndexStats = { enabled: ENABLE_REFERENCE_INDEX, symbolCount: 0, edgeCount: 0, indexedFiles: 0 };
  if (ENABLE_REFERENCE_INDEX && !reachedDeadline()) {
    logProgress("reference-index-start", { sourceFiles: sourceRecords.length });
    const mentionIndex = buildMentionIndex(sourceRecords);
    const symbolNodes = [...nodes.values()].filter((s) => s.type === "symbol");
    const stats = addProbableReferenceEdges({ symbolNodes, mentionIndex, edges });
    referenceIndexStats = { enabled: true, indexedFiles: Math.min(sourceRecords.length, MAX_SOURCE_INDEX_FILES), ...stats };
    logProgress("reference-index-complete", referenceIndexStats);
  }

  const graph = {
    version: "2.3.0-local-graphrag-lite-leak-safe",
    generatedAt: new Date().toISOString(),
    root: path.basename(ROOT),
    mode: MODE,
    limits: {
      includeTests: INCLUDE_TESTS,
      maxFiles: MAX_FILES,
      maxFileBytes: MAX_FILE_BYTES,
      maxSourceIndexFiles: MAX_SOURCE_INDEX_FILES,
      maxSymbolsForReferences: MAX_SYMBOLS_FOR_REFERENCES,
      maxReferenceEdgesPerSymbol: MAX_REFERENCE_EDGES_PER_SYMBOL,
      maxTotalReferenceEdges: MAX_TOTAL_REFERENCE_EDGES,
      timeoutMs: TIMEOUT_MS
    },
    stats: {
      filesDiscovered: files.length,
      filesProcessed: fileRecords.length,
      sourceFiles: sourceRecords.length,
      skippedEmptyOrLarge,
      nodes: nodes.size,
      edges: edges.size,
      timedOut,
      elapsedMs: elapsedMs(),
      referenceIndex: referenceIndexStats
    },
    nodes: [...nodes.values()],
    edges: [...edges.values()]
  };

  fs.writeFileSync(path.join(OUT_DIR, "graph.json"), JSON.stringify(graph, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT_DIR, "nodes.json"), JSON.stringify(graph.nodes, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT_DIR, "edges.json"), JSON.stringify(graph.edges, null, 2) + "\n");
  fs.writeFileSync(path.join(OUT_DIR, "summary.md"), `# Code Graph Summary\n\nGenerated: ${graph.generatedAt}\n\n- Mode: ${graph.mode}\n- Files discovered: ${graph.stats.filesDiscovered}\n- Files processed: ${graph.stats.filesProcessed}\n- Source files: ${graph.stats.sourceFiles}\n- Nodes: ${graph.stats.nodes}\n- Edges: ${graph.stats.edges}\n- Timed out gracefully: ${graph.stats.timedOut}\n- Elapsed ms: ${graph.stats.elapsedMs}\n\nRun:\n\n\`\`\`bash\nnpm run ai:graph:query -- \"<symbol or feature>\"\n\`\`\`\n\nPerformance controls:\n\n\`\`\`bash\nnpm run ai:graph:build:fast\nnpm run ai:graph:build:minimal\nnpm run ai:graph:build:full\nAI_GRAPH_MAX_FILES=1500 npm run ai:graph:build\nAI_GRAPH_PROGRESS=0 npm run ai:graph:build\n\`\`\`\n`);

  console.log(JSON.stringify({ ok: true, outDir: toPosix(path.relative(ROOT, OUT_DIR)), mode: MODE, stats: graph.stats }, null, 2));
  process.exit(0);
}

main();
