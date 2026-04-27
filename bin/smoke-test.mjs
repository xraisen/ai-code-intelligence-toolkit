#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ai-code-intel-smoke-"));
const npmCli = process.env.npm_execpath || null;
fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "fixture", private: true, type: "module", scripts: {} }, null, 2));
fs.mkdirSync(path.join(tmp, "src"));
fs.writeFileSync(path.join(tmp, "src", "index.ts"), "export function hello(name:string){ return `hello ${name}` }\n");
fs.writeFileSync(path.join(tmp, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", strict: false }, include: ["src/**/*"] }, null, 2));
function run(cmd, args, cwd = tmp) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) { console.error(r.stdout); console.error(r.stderr); throw new Error(`${cmd} ${args.join(" ")} failed`); }
  return r;
}
function quoteForCmd(part) {
  return `"${String(part).replaceAll('"', '\\"')}"`;
}
function runNpm(args, cwd = tmp) {
  if (npmCli) return run(process.execPath, [npmCli, ...args], cwd);
  if (process.platform === "win32") {
    const cmd = process.env.ComSpec || "cmd.exe";
    return run(cmd, ["/d", "/s", "/c", [ "npm", ...args ].map(quoteForCmd).join(" ")], cwd);
  }
  return run("npm", args, cwd);
}
run(process.execPath, [path.join(root, "bin", "install.mjs"), "--target", tmp, "--overwrite"], root);
runNpm(["run", "typedoc:health"], tmp);
runNpm(["run", "ai:graph:build"], tmp);
runNpm(["run", "ai:graph:doctor"], tmp);
runNpm(["run", "ai:graph:check-leaks"], tmp);
console.log(JSON.stringify({ ok: true, tmp }, null, 2));
