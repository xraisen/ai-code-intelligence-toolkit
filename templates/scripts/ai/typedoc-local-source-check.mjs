#!/usr/bin/env node
/**
 * Fails if local TypeDoc JSON/config still points to placeholder or GitHub blob links.
 * Intended local output comes from:
 *   npm run typedoc:json:local
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const typedocPath = path.join(root, "typedoc-api.json");
const configCandidates = ["typedoc.local.generated.json", "typedoc.auto.generated.json", "typedoc.json"];

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch {
    return null;
  }
}

const errors = [];
const configName = configCandidates.find((name) => fs.existsSync(path.join(root, name))) || "typedoc.json";
const config = readJson(path.join(root, configName));
const text = read(typedocPath);

if (!config) errors.push(`${configName} is missing or invalid JSON.`);
if (!text.trim()) errors.push("typedoc-api.json is missing or empty. Run npm run typedoc:json:local.");

if (config) {
  const template = String(config.sourceLinkTemplate || "");
  if (/github\.com|\/blob\//i.test(template)) {
    errors.push(`${configName} sourceLinkTemplate points to GitHub; expected local source links.`);
  }
  if (/your-username|your-repo/i.test(template)) {
    errors.push(`${configName} still uses placeholder GitHub repository text.`);
  }
  if (template && (!template.includes("{path}") || !template.includes("{line}"))) {
    errors.push(`${configName} sourceLinkTemplate should include {path} and {line}.`);
  }
}

if (/github\.com\/your-username\/your-repo/i.test(text)) {
  errors.push("typedoc-api.json contains placeholder GitHub source links.");
}
if (/github\.com\/[^"]+\/blob\//i.test(text)) {
  errors.push("typedoc-api.json contains GitHub blob links; run npm run typedoc:json:local for AI/local use.");
}
try {
  if (text.trim()) JSON.parse(text);
} catch (error) {
  errors.push(`typedoc-api.json is not valid JSON: ${error.message}`);
}

console.log(
  JSON.stringify(
    {
      ok: errors.length === 0,
      typedocPath: "typedoc-api.json",
      configPath: configName,
      sourceLinkTemplate: config?.sourceLinkTemplate ?? null,
      errors,
      next: errors.length ? ["npm run typedoc:json:local", "npm run typedoc:check-local"] : [],
    },
    null,
    2
  )
);

process.exit(errors.length ? 1 : 0);
