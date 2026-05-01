#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const graphPath = path.resolve(root, ".ai/code-graph/graph.json");
const forbidden = /(^|\/)(node_modules|dist|build|out|output|coverage|\.next|\.nuxt|\.svelte-kit|docs\/api[^/]*|public\/docs|android\/app\/src\/main\/assets\/public|ios\/App\/App\/public|documentation\/archive|supabase\/migrations\/_archive)(\/|$)|(^|\/)(typedoc-api(?:\.[^.\/]+)?\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|repomix-output.*|.*\.generated\..*)$/i;
function readJson(file){ try { return JSON.parse(fs.readFileSync(file,"utf8")); } catch { return null; } }
const graph = readJson(graphPath);
if (!graph) { console.log(JSON.stringify({ ok:false, error:".ai/code-graph/graph.json missing. Run npm run ai:graph:build." }, null, 2)); process.exit(1); }
const paths = new Set();
for (const node of graph.nodes || []) if (node.path) paths.add(String(node.path).replace(/\\/g,"/"));
for (const file of graph.files || []) if (file.path) paths.add(String(file.path).replace(/\\/g,"/"));
const leaks = Array.from(paths).filter((p) => forbidden.test(p)).sort();
const ok = leaks.length === 0;
console.log(JSON.stringify({ ok, leakCount: leaks.length, leaks }, null, 2));
process.exit(ok ? 0 : 1);
