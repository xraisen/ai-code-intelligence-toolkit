#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { AI_INTELLIGENCE_REQUIRED_FILES as REQUIRED_FILES, AI_INTELLIGENCE_REQUIRED_SCRIPT_NAMES } from "../ai/graphrag-script-contract.mjs";
const root = process.cwd();
function exists(rel){ return fs.existsSync(path.resolve(root, rel)); }
function readJson(rel){ try { return JSON.parse(fs.readFileSync(path.resolve(root, rel), "utf8")); } catch { return null; } }
function statMs(rel){ try { return fs.statSync(path.resolve(root, rel)).mtimeMs; } catch { return null; } }
function countText(rel, re){ try { return (fs.readFileSync(path.resolve(root, rel), "utf8").match(re) || []).length; } catch { return 0; } }
function countSymbolIndex(){ const x = readJson("AI_SYMBOL_INDEX.json"); if (!x) return 0; if (Array.isArray(x)) return x.length; if (Array.isArray(x.symbols)) return x.symbols.length; if (x.symbols && typeof x.symbols === "object") return Object.keys(x.symbols).length; return 0; }
function forbiddenGraphLeaks(graph){
  const re = /(^|\/)(node_modules|dist|build|out|output|coverage|\.next|\.nuxt|\.svelte-kit|docs\/api[^/]*|public\/docs|android\/app\/src\/main\/assets\/public|ios\/App\/App\/public|documentation\/archive|supabase\/migrations\/_archive)(\/|$)|(^|\/)(typedoc-api(?:\.[^.\/]+)?\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|repomix-output.*|.*\.generated\..*)$/i;
  const paths = new Set();
  for (const n of graph.nodes || []) if (n.path) paths.add(String(n.path).replace(/\\/g,"/"));
  for (const f of graph.files || []) if (f.path) paths.add(String(f.path).replace(/\\/g,"/"));
  return Array.from(paths).filter((p) => re.test(p)).sort();
}
function collectTypeDocSourceUrls(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (Array.isArray(value)) { for (const item of value) collectTypeDocSourceUrls(item, out); return out; }
  if (value.url && typeof value.url === "string") out.push(value.url);
  if (Array.isArray(value.sources)) collectTypeDocSourceUrls(value.sources, out);
  if (Array.isArray(value.signatures)) collectTypeDocSourceUrls(value.signatures, out);
  if (Array.isArray(value.children)) collectTypeDocSourceUrls(value.children, out);
  return out;
}
function isGithubBlobUrl(url) { return /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\//i.test(url); }
const pkg = readJson("package.json");
const graph = readJson(".ai/code-graph/graph.json");
const typedoc = readJson("typedoc-api.json");
const requiredFileChecks = Object.fromEntries(Object.entries(REQUIRED_FILES).map(([name, rel]) => [name, { path: rel, ok: exists(rel) }]));
const scripts = pkg?.scripts || {};
const scriptChecks = Object.fromEntries(AI_INTELLIGENCE_REQUIRED_SCRIPT_NAMES.map((name) => [name, Boolean(scripts[name])]));
const missingFiles = Object.values(requiredFileChecks).filter((x) => !x.ok).map((x) => x.path);
const missingScripts = Object.entries(scriptChecks).filter(([, ok]) => !ok).map(([name]) => name);
const graphStats = graph ? { nodeCount: Array.isArray(graph.nodes) ? graph.nodes.length : 0, edgeCount: Array.isArray(graph.edges) ? graph.edges.length : 0, generatedAt: graph.generatedAt ?? null, leaks: forbiddenGraphLeaks(graph) } : null;
const graphUseful = Boolean(graphStats && graphStats.nodeCount >= 10 && graphStats.leaks.length === 0);
const typedocSourceUrls = typedoc ? collectTypeDocSourceUrls(typedoc) : [];
const typedocGithubBlobSourceUrls = typedocSourceUrls.filter(isGithubBlobUrl);
const typedocUsesGithubBlob = typedocGithubBlobSourceUrls.length > 0;
const warnings = [];
if (!graph) warnings.push("Graph missing. Run npm run ai:graph:build.");
if (graph && !graphUseful) warnings.push("Graph exists but appears too small or contains forbidden generated/archive paths.");
if (countText("AI_GROUND_TRUTH.md", /\b(symbol|function|class|component|hook|route|contract)\b/gi) === 0) warnings.push("AI_GROUND_TRUTH.md is present but sparse; enrich it for better routing.");
if (countSymbolIndex() === 0) warnings.push("AI_SYMBOL_INDEX.json is sparse or invalid; enrich it for better routing.");
if (typedocUsesGithubBlob) warnings.push(`typedoc-api.json contains ${typedocGithubBlobSourceUrls.length} GitHub blob source link(s). Regenerate locally with npm run typedoc:json:local.`);
const ok = missingFiles.length === 0 && missingScripts.length === 0 && graphUseful && !typedocUsesGithubBlob;
console.log(JSON.stringify({ ok, requiredFileChecks, scriptChecks, missingFiles, missingScripts, graphStats, groundTruthSymbolCount: countText("AI_GROUND_TRUTH.md", /\b(symbol|function|class|component|hook|route|contract)\b/gi), symbolIndexCount: countSymbolIndex(), typedoc: { present: Boolean(typedoc), sourceUrlCount: typedocSourceUrls.length, githubBlobSourceUrlCount: typedocGithubBlobSourceUrls.length, usesGithubBlobLinks: typedocUsesGithubBlob }, freshness: { graphMtime: statMs(".ai/code-graph/graph.json"), groundTruthMtime: statMs("AI_GROUND_TRUTH.md"), symbolIndexMtime: statMs("AI_SYMBOL_INDEX.json"), typedocMtime: statMs("typedoc-api.json") }, warnings, next: ok ? [] : ["npm run typedoc:health", "npm run typedoc:json:local", "npm run typedoc:check-local", "npm run ai:graph:build", "npm run ai:graph:doctor", "npm run ai:graph:check-leaks"] }, null, 2));
process.exit(ok ? 0 : 1);
