#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const root = process.cwd();
const roots = ["bin", "templates", "scripts"].filter((rel) => fs.existsSync(path.join(root, rel)));
function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.isFile() && abs.endsWith(".mjs")) out.push(abs);
  }
  return out;
}
const files = roots.flatMap((rel) => walk(path.join(root, rel)));
const failures = [];
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) failures.push({ file: path.relative(root, file).replace(/\\/g, "/"), stderr: result.stderr });
}
console.log(JSON.stringify({ ok: failures.length === 0, checked: files.length, failures }, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
