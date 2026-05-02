#!/usr/bin/env node
import { spawnSync } from "node:child_process";
const result = spawnSync("npx", ["--no-install", "typedoc", "--options", "typedoc-strict.json"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, TYPEDOC_STRICT: "true" }
});
process.exit(result.status ?? 1);
