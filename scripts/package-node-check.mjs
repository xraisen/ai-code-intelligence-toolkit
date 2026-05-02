#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = ["package.json", "README.md", "LICENSE", "index.js", "bin/install.mjs"];
const failures = [];
const conflictMarkerRe = /^(<<<<<<<|=======|>>>>>>>)(?:\s|$)/m;

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, out);
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push({ file, error: "Missing required package file." });
}

let packageJson = null;
try {
  const text = read("package.json");
  packageJson = JSON.parse(text);
  if (conflictMarkerRe.test(text)) failures.push({ file: "package.json", error: "Git conflict marker found." });
} catch (error) {
  failures.push({ file: "package.json", error: `Invalid JSON: ${error.message}` });
}

for (const abs of walk(root)) {
  const rel = path.relative(root, abs).replace(/\\/g, "/");
  if (rel.includes("node_modules/") || rel.endsWith(".tgz") || rel.endsWith(".zip")) continue;
  const text = fs.readFileSync(abs, "utf8");
  if (conflictMarkerRe.test(text)) failures.push({ file: rel, error: "Git conflict marker found." });
}

if (packageJson) {
  for (const key of ["name", "version", "type", "main", "bin", "files", "scripts", "license"]) {
    if (!(key in packageJson)) failures.push({ file: "package.json", error: `Missing key: ${key}` });
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  package: packageJson?.name || null,
  version: packageJson?.version || null,
  checked: {
    requiredFiles: requiredFiles.length,
    repositoryFiles: walk(root).length
  },
  failures
}, null, 2));

process.exit(failures.length === 0 ? 0 : 1);
