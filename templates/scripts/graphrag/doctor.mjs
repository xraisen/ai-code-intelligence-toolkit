#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { getRequiredGraphRagFiles, AI_INTELLIGENCE_REQUIRED_SCRIPT_NAMES } from "../ai/graphrag-script-contract.mjs";
const ROOT = process.cwd();
const REQUIRED_FILES = getRequiredGraphRagFiles();
const FORBIDDEN_PREFIXES = ["docs/api/", "docs/api-local/", "docs/api-github/", "docs/api-frontend/", "docs/api-frontend-local/", "docs/api-frontend-github/", "public/docs/", "android/app/src/main/assets/public/", "ios/App/App/public/", "output/", "documentation/archive/", "supabase/migrations/_archive/", "node_modules/", "dist/", "build/", "coverage/", "playwright-report/", "test-results/", "typedoc.auto.generated.json", "typedoc.local.generated.json", "typedoc.github.generated.json", "typedoc-frontend.auto.generated.json", "typedoc-frontend.local.generated.json", "typedoc-frontend.github.generated.json", "typedoc-api.json"];
function abs(r) { return path.join(ROOT, r); }
function exists(r) { return fs.existsSync(abs(r)); }
function readJson(r) { try { return JSON.parse(fs.readFileSync(abs(r), "utf8")); } catch { return null; } }
function statMs(r) { try { return fs.statSync(abs(r)).mtimeMs; } catch { return null; } }
function normalizePath(v) { return String(v || "").replaceAll("\\", "/").replace(/^\.\//, ""); }
function isForbiddenPath(v) { const n = normalizePath(v); if (!n) return false; return FORBIDDEN_PREFIXES.some((p) => p.endsWith("/") ? n.startsWith(p) || n.includes(`/${p}`) : n === p || n.endsWith(`/${p}`)); }
function forbiddenGraphLeaks(graph) { const leaks = []; for (const node of graph.nodes || []) { for (const c of [node.path, node.source, node.targetPath, node.file, node.evidence]) { const v = normalizePath(c); if (isForbiddenPath(v)) leaks.push(v); } } for (const edge of graph.edges || []) { for (const c of [edge.evidence, edge.path, edge.file]) { const v = normalizePath(c); if (isForbiddenPath(v)) leaks.push(v); } } return [...new Set(leaks)].slice(0, 50); }
function countText(rel, rx) { try { return (fs.readFileSync(abs(rel), "utf8").match(rx) || []).length; } catch { return 0; } }
function countSymbolIndex() { const data = readJson("AI_SYMBOL_INDEX.json"); if (!data) return 0; let count = 0; const seen = new Set(); function visit(v) { if (!v || typeof v !== "object" || seen.has(v)) return; seen.add(v); if (Array.isArray(v)) { for (const i of v) visit(i); return; } if (typeof v.name === "string" || typeof v.path === "string" || typeof v.kind === "string") count += 1; for (const child of Object.values(v)) visit(child); } visit(data); return count; }
const pkg = readJson("package.json");
const graph = readJson(".ai/code-graph/graph.json");
const typedoc = readJson("typedoc-api.json");
const requiredFileChecks = Object.fromEntries(Object.entries(REQUIRED_FILES).map(([name, rel]) => [name, { path: rel, ok: exists(rel) }]));
const scripts = pkg?.scripts || {};
const scriptChecks = Object.fromEntries(AI_INTELLIGENCE_REQUIRED_SCRIPT_NAMES.map((name) => [name, Boolean(scripts[name])]));
const missingFiles = Object.values(requiredFileChecks).filter((x) => !x.ok).map((x) => x.path);
const missingScripts = Object.entries(scriptChecks).filter(([, ok]) => !ok).map(([name]) => name);
const graphStats = graph ? { nodeCount: Array.isArray(graph.nodes) ? graph.nodes.length : 0, edgeCount: Array.isArray(graph.edges) ? graph.edges.length : 0, generatedAt: graph.generatedAt ?? null, leaks: forbiddenGraphLeaks(graph) } : null;
const graphUseful = Boolean(graphStats && graphStats.nodeCount >= 10 && graphStats.edgeCount >= 5 && graphStats.leaks.length === 0);
const typedocSourceText = typedoc ? JSON.stringify(typedoc).toLowerCase() : "";
const typedocUsesGithubBlob = /github\.com\/[^\s"']+\/blob\//i.test(typedocSourceText);
const warnings = [];
if (!graph) warnings.push("Graph missing. Run npm run ai:graph:build.");
if (graph && !graphUseful) warnings.push("Graph exists but appears too small or contains forbidden generated/archive paths.");
if (countText("AI_GROUND_TRUTH.md", /\b(symbol|function|class|component|hook|route|contract)\b/gi) === 0) warnings.push("AI_GROUND_TRUTH.md is present but sparse; enrich it for better routing.");
if (countSymbolIndex() === 0) warnings.push("AI_SYMBOL_INDEX.json is sparse or invalid; enrich it for better routing.");
if (typedocUsesGithubBlob) warnings.push("typedoc-api.json contains GitHub blob links. Regenerate locally with npm run typedoc:json:local.");
const ok = missingFiles.length === 0 && missingScripts.length === 0 && graphUseful && !typedocUsesGithubBlob;
console.log(JSON.stringify({ ok, requiredFileChecks, scriptChecks, missingFiles, missingScripts, graphStats, groundTruthSymbolCount: countText("AI_GROUND_TRUTH.md", /\b(symbol|function|class|component|hook|route|contract)\b/gi), symbolIndexCount: countSymbolIndex(), typedoc: { present: Boolean(typedoc), usesGithubBlobLinks: typedocUsesGithubBlob }, freshness: { graphMtime: statMs(".ai/code-graph/graph.json"), groundTruthMtime: statMs("AI_GROUND_TRUTH.md"), symbolIndexMtime: statMs("AI_SYMBOL_INDEX.json"), typedocMtime: statMs("typedoc-api.json") }, warnings, next: ok ? [] : ["node scripts/ai/install-ai-intelligence.mjs", "npm run typedoc:health", "npm run ai:graph:build", "npm run ai:graph:doctor", "npm run ai:graph:check-leaks"] }, null, 2));
process.exit(ok ? 0 : 1);
