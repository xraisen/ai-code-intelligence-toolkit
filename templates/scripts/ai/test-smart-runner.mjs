#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const args = process.argv.slice(2);
const command = args.join(" ").trim();
const memoryDir = path.join(root, ".ai", "test-memory");
const memoryPath = path.join(memoryDir, "test-runs.json");
const ignoreDirs = new Set([".git", "node_modules", "dist", "build", "out", "coverage", ".next", ".nuxt", ".svelte-kit", ".ai/test-memory"]);
const includeExt = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css", ".scss", ".html", ".yml", ".yaml"]);
function rel(p){ return path.relative(root, p).replace(/\\/g, "/"); }
function readJson(file, fallback){ try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJson(file, obj){ fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n"); }
function walk(dir, out=[]){
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const r = rel(full);
    if (ent.isDirectory()) {
      if ([...ignoreDirs].some((d) => r === d || r.startsWith(d + "/"))) continue;
      walk(full, out);
    } else if (ent.isFile()) {
      if (includeExt.has(path.extname(ent.name).toLowerCase()) || ["package-lock.json", "pnpm-lock.yaml", "yarn.lock"].includes(ent.name)) out.push(full);
    }
  }
  return out;
}
function fingerprint(){
  const hash = crypto.createHash("sha256");
  const files = walk(root).sort((a,b) => rel(a).localeCompare(rel(b)));
  for (const file of files) {
    const stat = fs.statSync(file);
    hash.update(rel(file));
    hash.update(String(stat.size));
    hash.update(fs.readFileSync(file));
  }
  return { hash: hash.digest("hex"), fileCount: files.length };
}
function memory(){ return readJson(memoryPath, { schemaVersion: 1, runs: [] }); }
function status(){
  const m = memory();
  return { ok: true, command: "status", memoryPath: rel(memoryPath), totalRuns: m.runs.length, latest: m.runs.slice(-10), next: ["npm run ai:test:smart -- \"npm run test\"", "npm run ai:test:smart -- \"npm run build\""] };
}
if (!command || command === "status" || args.includes("--status")) {
  console.log(JSON.stringify(status(), null, 2));
  process.exit(0);
}
const fp = fingerprint();
const m = memory();
const previous = [...m.runs].reverse().find((r) => r.command === command && r.fingerprint === fp.hash && r.status === "passed");
if (previous && !args.includes("--force")) {
  const result = { ok: true, skipped: true, reason: "Same validation command already passed for the unchanged repository fingerprint.", command, fingerprint: fp.hash, previousRun: previous, memoryPath: rel(memoryPath), force: `npm run ai:test:smart -- ${JSON.stringify(command + " --force")}` };
  m.runs.push({ command, fingerprint: fp.hash, status: "skipped", skippedBecauseRunId: previous.runId, createdAt: new Date().toISOString(), fileCount: fp.fileCount });
  writeJson(memoryPath, m);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}
const runId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString("hex");
const startedAt = new Date().toISOString();
const child = spawnSync(command, { shell: true, cwd: root, stdio: "inherit", env: process.env });
const endedAt = new Date().toISOString();
const statusValue = child.status === 0 ? "passed" : "failed";
m.runs.push({ runId, command, fingerprint: fp.hash, fileCount: fp.fileCount, status: statusValue, exitCode: child.status ?? 1, startedAt, endedAt });
writeJson(memoryPath, m);
console.log(JSON.stringify({ ok: statusValue === "passed", skipped: false, command, status: statusValue, exitCode: child.status ?? 1, fingerprint: fp.hash, memoryPath: rel(memoryPath) }, null, 2));
process.exit(child.status ?? 1);
