#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const query = process.argv.slice(2).join(" ").trim();
function readJson(rel) { try { return JSON.parse(fs.readFileSync(path.resolve(root, rel), "utf8")); } catch { return null; } }
function toPosix(p) { return String(p || "").replace(/\\/g, "/"); }
function shellQuote(value) { return `'${String(value).replace(/'/g, `'\\''`)}'`; }
function psQuote(value) { return `'${String(value || "").replace(/'/g, "''")}'`; }
function safeNeedle(value, fallback="target") {
  const text = String(value || fallback).trim();
  return text.length > 120 ? text.slice(0, 120) : text;
}
function readCommands(relPath, line=1, needle="") {
  const start = Math.max(1, Number(line || 1) - 40);
  const end = start + 100;
  const pattern = safeNeedle(needle || path.basename(relPath));
  return {
    powershell: `Select-String -Path ${psQuote(relPath)} -Pattern ${psQuote(pattern)} -SimpleMatch -Context 40,60 | Select-Object -First 1`,
    powershellGroundTruthFirst: `Select-String -Path 'AI_GROUND_TRUTH.md','AI_SYMBOL_INDEX.json' -Pattern ${psQuote(pattern)} -SimpleMatch -Context 4,8`,
    bash: `sed -n '${start},${end}p' ${shellQuote(relPath)}`,
    note: "PowerShell contract: use Select-String for bounded context first; avoid broad Get-Content or rg before graph/symbol lookup."
  };
}
function roleForPath(relPath) {
  const normalized = toPosix(relPath);
  if (/(__tests__|\.test\.|\/tests\/)/.test(normalized)) return "test_contract";
  if (normalized === "src/types/index.ts" || normalized.includes("/types/")) return "type_contract";
  if (normalized.endsWith(".md")) return "source_of_truth_doc";
  if (normalized.includes("supabase/functions/")) return "edge_function";
  if (normalized.includes("supabase/migrations/")) return "database_contract";
  if (normalized.includes("/scripts/validation/")) return "validation_script";
  if (normalized.includes("/scripts/") || normalized.startsWith("scripts/")) return "tooling_script";
  if (normalized.includes("/hooks/")) return "hook";
  if (normalized.includes("/components/")) return "implementation";
  if (normalized.includes("/pages/") || normalized.includes("/app/")) return "route_or_page";
  return "implementation";
}
function isForbidden(relPath) { return /(^|\/)(node_modules|dist|build|out|output|coverage|docs\/api[^/]*|public\/docs)(\/|$)|(^|\/)(typedoc-api(?:\.[^.\/]+)?\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|.*\.generated\..*)$/i.test(toPosix(relPath)); }
function confidence(score) { return score >= 80 ? "high" : score >= 40 ? "medium" : "low"; }
function keywords(text) { return String(text || "").toLowerCase().split(/[^a-z0-9_$:-]+/).filter((x) => x.length >= 2); }
function isPatchCandidate(relPath) {
  const role = roleForPath(relPath);
  return !isForbidden(relPath) && !["test_contract", "source_of_truth_doc"].includes(role);
}
function symbolIndexMatches(symbolIndex, qWords) {
  const matches = [];
  for (const item of symbolIndex?.symbols || []) {
    const hay = `${item.name || ""} ${item.path || ""} ${item.kind || ""}`.toLowerCase();
    let score = 0;
    for (const k of qWords) if (hay.includes(k)) score += 25 + Math.min(k.length, 25);
    if (score > 0 && item.path) matches.push({ name: item.name, path: toPosix(item.path), kind: item.kind || "symbol", score });
  }
  matches.sort((a,b) => b.score - a.score || a.path.localeCompare(b.path));
  return matches.slice(0, 8);
}
const graph = readJson(".ai/code-graph/graph.json");
if (!graph) { console.log(JSON.stringify({ ok:false, error:"Graph missing. Run npm run typedoc:json:local && npm run ai:graph:build first.", next:["npm run typedoc:json:local && npm run ai:graph:build"] }, null, 2)); process.exit(1); }
const symbolIndex = readJson("AI_SYMBOL_INDEX.json");
const q = keywords(query);
const indexedSymbols = symbolIndexMatches(symbolIndex, q);
const candidates = [];
for (const node of graph.nodes || []) {
  const p = toPosix(node.path);
  if (!p || isForbidden(p)) continue;
  let score = 0;
  const hay = `${node.name || ""} ${node.kind || ""} ${p} ${node.role || ""}`.toLowerCase();
  for (const k of q) {
    if (hay.includes(k)) score += 20 + Math.min(k.length, 20);
    if (p.toLowerCase().includes(k)) score += 10;
  }
  if (indexedSymbols.some((s) => s.path === p || s.name === node.name)) score += 35;
  if (!query) score = p.match(/^(AGENTS|README|AI_GROUND_TRUTH|AI_SYMBOL_INDEX)/) ? 100 : 0;
  if (score > 0) {
    const role = roleForPath(p);
    const needle = node.name || query || path.basename(p);
    candidates.push({ path:p, line:node.line || 1, name:node.name || path.basename(p), kind:node.kind || "file", role, score, confidence:confidence(score), patchCandidate:isPatchCandidate(p), readCommands: readCommands(p, node.line || 1, needle) });
  }
}
candidates.sort((a,b) => b.score - a.score || a.path.localeCompare(b.path));
const top = [];
const seen = new Set();
for (const c of candidates) {
  const key = `${c.path}:${c.name}:${c.line}`;
  if (seen.has(key)) continue;
  seen.add(key);
  top.push(c);
  if (top.length >= 12) break;
}
const allowedPatchFiles = Array.from(new Set(top.filter((c) => c.patchCandidate).map((c) => c.path))).slice(0, 8);
console.log(JSON.stringify({
  ok:true,
  query,
  generatedAt: graph.generatedAt,
  mandatoryBeforeEdit: "npm run typedoc:json:local && npm run ai:graph:build",
  sourceTruthOrder: ["AGENTS.md", "README.md", "AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json", ".ai/code-graph/graph.json", "Select-String bounded file context"],
  indexedSymbols,
  candidates: top,
  allowedPatchFiles,
  powershellContract: {
    required: "Use the returned Select-String commands before source edits.",
    avoid: ["Get-Content broad dumps", "rg broad repo search before graph/symbol lookup"]
  },
  next: allowedPatchFiles.length ? ["Read only the returned Select-String bounded contexts.", "Patch only allowedPatchFiles unless preflight expands scope.", "After modification: npm run typedoc:json:local && npm run ai:graph:build, then validate."] : ["Make the query more specific, then run ai:preflight."]
}, null, 2));
