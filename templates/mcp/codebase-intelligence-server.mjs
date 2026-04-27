#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const ROOT = process.cwd();
const VERSION = "1.0.0";
const CONTRACT_FILES = ["AGENTS.md", "README.md", "AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json", "docs/ARCHITECTURE.md", "documentation/ARCHITECTURE.md", "docs/DB.md", "documentation/DB.md"];
const FORBIDDEN_PREFIXES = ["node_modules/", ".git/", "dist/", "build/", "coverage/", "docs/api/", "public/docs/", ".ai/code-graph/"];
function abs(r) { return path.join(ROOT, r); }
function normalize(r) { return String(r || "").replaceAll("\\", "/").replace(/^\.\//, ""); }
function exists(r) { return fs.existsSync(abs(r)); }
function isForbidden(r) { const n = normalize(r); return FORBIDDEN_PREFIXES.some((p) => n === p || n.startsWith(p)); }
function runNodeScript(script, args = []) { const result = spawnSync(process.execPath, [script, ...args], { cwd: ROOT, encoding: "utf8" }); const output = (result.stdout || result.stderr || "").trim(); try { return JSON.parse(output); } catch { return { ok: result.status === 0, status: result.status, output }; } }
function readWindow(file, startLine = 1, count = 80) { const n = normalize(file); if (!n || isForbidden(n)) return { ok: false, error: "file not allowed" }; if (!exists(n)) return { ok: false, error: "file not found", path: n }; const lines = fs.readFileSync(abs(n), "utf8").split(/\r?\n/); const start = Math.max(1, Number(startLine) || 1); const limit = Math.min(Math.max(Number(count) || 80, 1), 300); return { ok: true, path: n, startLine: start, count: Math.min(limit, lines.length - start + 1), totalLines: lines.length, text: lines.slice(start - 1, start - 1 + limit).join("\n") }; }
function searchContracts(pattern, context = 2) { const raw = String(pattern || "").trim(); if (!raw) return { ok: false, error: "pattern is required" }; let rx; try { rx = new RegExp(raw, "i"); } catch { rx = new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); } const ctx = Math.min(Math.max(Number(context) || 2, 0), 8); const results = []; for (const file of CONTRACT_FILES) { if (!exists(file) || isForbidden(file)) continue; const lines = fs.readFileSync(abs(file), "utf8").split(/\r?\n/); for (let i = 0; i < lines.length; i += 1) { if (!rx.test(lines[i])) continue; const start = Math.max(0, i - ctx); const end = Math.min(lines.length, i + ctx + 1); results.push({ path: file, line: i + 1, context: lines.slice(start, end).map((text, index) => ({ line: start + index + 1, text })) }); if (results.length >= 30) return { ok: true, truncated: true, pattern: raw, results }; } } return { ok: true, truncated: false, pattern: raw, results }; }
const toolNames = ["codebase_preflight", "codebase_spec", "codebase_graph_query", "codebase_graph_build", "codebase_graph_doctor", "codebase_read_window", "codebase_search_contracts"];
function callTool(name, args = {}) { switch (name) { case "codebase_preflight": return runNodeScript("scripts/ai/codex-preflight.mjs", [String(args.task || "test")]); case "codebase_spec": return runNodeScript("scripts/ai/spec-preflight.mjs", [String(args.task || "inspect")]); case "codebase_graph_query": return runNodeScript("scripts/graphrag/query-code-graph.mjs", [String(args.query || "")]); case "codebase_graph_build": return runNodeScript("scripts/graphrag/build-code-graph.mjs"); case "codebase_graph_doctor": return runNodeScript("scripts/graphrag/doctor.mjs"); case "codebase_read_window": return readWindow(args.path, args.startLine, args.count); case "codebase_search_contracts": return searchContracts(args.pattern, args.context); default: return { ok: false, error: `Unknown tool: ${name}`, tools: toolNames }; } }
function emit(r) { process.stdout.write(`${JSON.stringify(r)}\n`); }
if (process.argv[2] === "--list") { emit({ ok: true, version: VERSION, tools: toolNames }); process.exit(0); }
if (process.argv[2] === "--call") { emit(callTool(process.argv[3], process.argv[4] ? JSON.parse(process.argv[4]) : {})); process.exit(0); }
emit({ ok: true, version: VERSION, mode: "cli-compatible", tools: toolNames, hint: "Use --list or --call <tool> '<json>' for local testing." });
