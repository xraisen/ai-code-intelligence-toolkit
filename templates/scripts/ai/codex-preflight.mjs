#!/usr/bin/env node
const task = process.argv.slice(2).join(" ").trim();
const q = task.toLowerCase();
function includesAny(words){ return words.some((w) => q.includes(w)); }
let route = "application_code";
let allowedReadFiles = ["AGENTS.md", "README.md", "AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json", ".ai/code-graph/graph.json"];
let allowedPatchFiles = [];
let validationCommands = ["npm run typedoc:json:local && npm run ai:graph:build", "npm run ai:graph:doctor", "npm run ai:graph:check-leaks"];
if (includesAny(["typedoc", "source link", "docs", "documentation"])) {
  route = "typedoc_tooling";
  allowedPatchFiles = ["scripts/typedoc-source-config.mjs", "scripts/typedoc-source-link-doctor.mjs", "scripts/typedoc-tool-health.mjs", "scripts/ai/typedoc-local-source-check.mjs", "typedoc.json", "typedoc-frontend.json", "typedoc-ci.json", "typedoc-strict.json", "tsconfig.doc.json", "types/typedoc-local-shims.d.ts", "README.md", "AGENTS.md"];
  validationCommands = ["npm run typedoc:health", "npm run typedoc:json:local", "npm run typedoc:check-local", "npm run ai:graph:build", "npm run ai:graph:doctor"];
} else if (includesAny(["graph", "graphrag", "preflight", "leak", "ai:spec", "ai:preflight", "select-string", "select string", "ground truth", "symbol index"])) {
  route = "graphrag_tooling";
  allowedPatchFiles = ["scripts/graphrag/build-code-graph.mjs", "scripts/graphrag/query-code-graph.mjs", "scripts/graphrag/doctor.mjs", "scripts/graphrag/check-no-leaks.mjs", "scripts/ai/spec-preflight.mjs", "scripts/ai/codex-preflight.mjs", "scripts/ai/graphrag-script-contract.mjs", "mcp/codebase-intelligence-server.mjs", "README.md", "AGENTS.md", "AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json"];
  validationCommands = ["npm run typedoc:json:local && npm run ai:graph:build", "npm run ai:graph:doctor", "npm run ai:graph:check-leaks"];
} else {
  allowedPatchFiles = [];
  validationCommands = ["npm run typedoc:json:local && npm run ai:graph:build", "npm run ai:graph:query -- " + JSON.stringify(task || "specific symbol/file/error/feature"), "run project-specific tests after graph query identifies files"];
}
console.log(JSON.stringify({
  ok: true,
  phase: "ai:preflight",
  task,
  route,
  mandatoryBeforeAnyEdit: [
    "npm run typedoc:json:local && npm run ai:graph:build",
    "npm run ai:spec -- " + JSON.stringify(task || "task description"),
    "npm run ai:graph:query -- " + JSON.stringify(task || "specific symbol/file/error/feature"),
    "npm run ai:preflight -- " + JSON.stringify(task || "task description")
  ],
  allowedReadFiles,
  allowedPatchFiles,
  validationCommands,
  navigationContract: [
    "Treat AI_GROUND_TRUTH.md as the directory map for approved symbols, scripts, files, and contracts.",
    "Treat AI_SYMBOL_INDEX.json as the dictionary for symbol-to-path lookup.",
    "Use .ai/code-graph/graph.json only after it has been rebuilt in the current edit cycle.",
    "Locate files through ground truth, symbol index, and ai:graph:query before touching implementation files."
  ],
  powershellContract: {
    requiredContextCommand: "Select-String -Path '<file>' -Pattern '<symbol or exact phrase>' -SimpleMatch -Context 40,60",
    forbiddenFirstPassCommands: ["Get-Content", "rg"],
    allowedException: "Use another command only after ai:graph:query returns an exact file and Select-String cannot expose the needed bounded context."
  },
  stopRules: [
    "Do not broad-search first.",
    "Do not patch files outside allowedPatchFiles without a new preflight.",
    "Do not treat generated files as source truth.",
    "Do not use Get-Content or rg as the first repo-navigation move in PowerShell.",
    "After modifications, rebuild TypeDoc local JSON and the graph before another edit cycle."
  ]
}, null, 2));
