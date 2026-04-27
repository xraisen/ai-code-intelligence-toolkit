#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const TARGET = path.resolve(getArg("--target", process.cwd()));
const OVERWRITE = args.includes("--overwrite") || args.includes("--force");
const DRY = args.includes("--dry-run");
const TEMPLATE_ROOT = path.join(PACKAGE_ROOT, "templates");
const PACKAGE_SCRIPTS_FILE = path.join(TEMPLATE_ROOT, "package.scripts.json");
const AGENTS_SNIPPET = fs.readFileSync(path.join(TEMPLATE_ROOT, "AGENTS_SNIPPET.md"), "utf8");
const README_SECTION = fs.readFileSync(path.join(TEMPLATE_ROOT, "README_SECTION.md"), "utf8");
function rel(p) { return path.relative(TARGET, p).replaceAll("\\", "/"); }
function ensureDir(p) { if (!DRY) fs.mkdirSync(p, { recursive: true }); }
function copyRecursive(src, dst, changes = []) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dst);
    for (const item of fs.readdirSync(src)) copyRecursive(path.join(src, item), path.join(dst, item), changes);
    return changes;
  }
  const r = rel(dst);
  const existed = fs.existsSync(dst);
  if (existed && !OVERWRITE) { changes.push({ file: r, action: "preserved" }); return changes; }
  ensureDir(path.dirname(dst));
  if (!DRY) fs.copyFileSync(src, dst);
  changes.push({ file: r, action: existed ? "overwritten" : "created" });
  return changes;
}
function copyTemplates() {
  const changes = [];
  for (const item of fs.readdirSync(TEMPLATE_ROOT)) {
    if (["AGENTS_SNIPPET.md", "README_SECTION.md", "package.scripts.json"].includes(item)) continue;
    copyRecursive(path.join(TEMPLATE_ROOT, item), path.join(TARGET, item), changes);
  }
  return changes;
}
function mergePackageScripts() {
  const pkgPath = path.join(TARGET, "package.json");
  const required = JSON.parse(fs.readFileSync(PACKAGE_SCRIPTS_FILE, "utf8"));
  let pkg = { name: path.basename(TARGET), private: true, type: "module", scripts: {} };
  if (fs.existsSync(pkgPath)) { pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")); pkg.scripts ||= {}; }
  const changed = [], preserved = [];
  for (const [name, cmd] of Object.entries(required)) {
    if (pkg.scripts[name] !== cmd) { pkg.scripts[name] = cmd; changed.push(name); }
    else preserved.push(name);
  }
  if (!DRY) fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  return { changed, preserved };
}
function upsertBlock(fileName, marker, content, title) {
  const p = path.join(TARGET, fileName);
  let text = fs.existsSync(p) ? fs.readFileSync(p, "utf8").trimEnd() : `# ${title}\n`;
  if (text.includes(marker)) return { file: fileName, action: "already-present" };
  const block = `\n\n<!-- ${marker}:start -->\n${content.trim()}\n<!-- ${marker}:end -->\n`;
  if (!DRY) fs.writeFileSync(p, text + block);
  return { file: fileName, action: "appended" };
}
function createIfMissing(relPath, content) {
  const p = path.join(TARGET, relPath);
  if (fs.existsSync(p)) return { file: relPath, action: "preserved" };
  ensureDir(path.dirname(p));
  if (!DRY) fs.writeFileSync(p, content);
  return { file: relPath, action: "created" };
}
function extraCreate() {
  return [
    createIfMissing("AI_GROUND_TRUTH.md", "# AI Ground Truth\n\nRepo-local static navigation contract. Add important symbols, paths, commands, APIs, routes, database tables, and validation notes here.\n\n## Starter symbols\n\n- symbol: package scripts\n  path: package.json\n  contract: Package scripts are the first automation entry point.\n"),
    createIfMissing("AI_SYMBOL_INDEX.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), symbols: [{ name: "package scripts", kind: "contract", path: "package.json" }] }, null, 2)}\n`)
  ];
}
function main() {
  if (!fs.existsSync(TARGET)) { console.error(JSON.stringify({ ok: false, error: `Target does not exist: ${TARGET}` }, null, 2)); process.exit(1); }
  const copied = copyTemplates();
  const scripts = mergePackageScripts();
  const docs = [upsertBlock("AGENTS.md", "ai-code-intelligence-toolkit", AGENTS_SNIPPET, "Agent Instructions"), upsertBlock("README.md", "ai-code-intelligence-toolkit", README_SECTION, "Project")];
  const extra = extraCreate();
  console.log(JSON.stringify({ ok: true, packageRoot: PACKAGE_ROOT, target: TARGET, overwrite: OVERWRITE, dryRun: DRY, copied, scripts, docs, extra, next: ["npm install", "npm run typedoc:health", "npm run ai:graph:build", "npm run ai:graph:doctor", "npm run ai:graph:check-leaks"] }, null, 2));
}
main();
