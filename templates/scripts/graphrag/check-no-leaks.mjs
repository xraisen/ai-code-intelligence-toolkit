#!/usr/bin/env node
/**
 * Fails if .ai/code-graph/graph.json contains generated/copied output paths.
 * This is intentionally narrower than doctor.mjs and is safe to run in CI.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GRAPH_PATH = path.join(ROOT, ".ai", "code-graph", "graph.json");

const FORBIDDEN_PREFIXES = [
  "docs/api/",
  "docs/api-local/",
  "docs/api-github/",
  "docs/api-frontend/",
  "docs/api-frontend-local/",
  "docs/api-frontend-github/",
  "public/docs/",
  "android/app/src/main/assets/public/",
  "ios/App/App/public/",
  "output/",
  "documentation/archive/",
  "supabase/migrations/_archive/",
  "node_modules/",
  "dist/",
  "build/",
  "coverage/",
  "playwright-report/",
  "test-results/",
  "typedoc.auto.generated.json",
  "typedoc.local.generated.json",
  "typedoc.github.generated.json",
  "typedoc-frontend.auto.generated.json",
  "typedoc-frontend.local.generated.json",
  "typedoc-frontend.github.generated.json",
  "typedoc-api.json"
];

function normalizePath(value) {
  return String(value || "").replaceAll("\\\\", "/").replace(/^\.\//, "");
}

function isForbiddenPath(value) {
  const normalized = normalizePath(value);
  if (!normalized) return false;

  return FORBIDDEN_PREFIXES.some((prefix) => {
    const isDirectoryPrefix = prefix.endsWith("/");

    if (isDirectoryPrefix) {
      // Directory prefixes must match as paths, not as bare node names.
      // Example: node.name === "build" is a valid symbol/name and must not fail leak checks.
      return normalized.startsWith(prefix) || normalized.includes(`/${prefix}`);
    }

    // File-level generated artifacts may be exact filenames or nested paths.
    return normalized === prefix || normalized.endsWith(`/${prefix}`);
  });
}

function collectLeaks(graph) {
  const leaks = [];
  for (const node of graph.nodes || []) {
    // Check only path-bearing fields. Do not check node.name because names like
    // "build", "public", or "docs" can be legitimate symbols/config labels.
    for (const candidate of [node.path, node.source, node.targetPath, node.file, node.evidence]) {
      const value = normalizePath(candidate);
      if (isForbiddenPath(value)) leaks.push(value);
    }
  }
  for (const edge of graph.edges || []) {
    // Edge IDs can contain symbol names and hashed identifiers, so evidence is the
    // reliable path-bearing field for leak detection.
    for (const candidate of [edge.evidence, edge.path, edge.file]) {
      const value = normalizePath(candidate);
      if (isForbiddenPath(value)) leaks.push(value);
    }
  }
  return [...new Set(leaks)].sort();
}

function main() {
  if (!fs.existsSync(GRAPH_PATH)) {
    console.error(JSON.stringify({ ok: false, error: "Graph missing. Run npm run ai:graph:build first.", graphPath: ".ai/code-graph/graph.json" }, null, 2));
    process.exit(1);
  }

  let graph;
  try {
    graph = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf8"));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: "Graph JSON is invalid.", detail: error.message }, null, 2));
    process.exit(1);
  }

  const leaks = collectLeaks(graph);
  const result = {
    ok: leaks.length === 0,
    checkedPrefixes: FORBIDDEN_PREFIXES,
    leakCount: leaks.length,
    leaks: leaks.slice(0, 50),
    next: leaks.length
      ? [
          "Patch scripts/graphrag/build-code-graph.mjs exclude rules.",
          "Run npm run ai:graph:build.",
          "Run npm run ai:graph:doctor.",
          "Run npm run ai:graph:check-leaks."
        ]
      : []
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main();
