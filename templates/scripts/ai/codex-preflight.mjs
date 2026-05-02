#!/usr/bin/env node
const task = process.argv.slice(2).join(" ").trim();
const q = task.toLowerCase();
function includesAny(words){ return words.some((w) => q.includes(w)); }
let route = "application_code";
let suggestedReadFiles = ["AGENTS.md", "README.md", "docs/ai-changelog/START_HERE.md", "docs/ai-changelog/history.index.json", "AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json", ".ai/code-graph/graph.json"];
let suggestedEditFiles = [];
let validationCommands = ["npm run ai:test:smart -- \"npm run build\"", "npm run typedoc:json:local && npm run ai:graph:build", "npm run ai:graph:doctor", "npm run ai:graph:check-leaks"];
if (includesAny(["typedoc", "source link", "docs", "documentation"])) {
  route = "typedoc_tooling";
  suggestedEditFiles = ["scripts/typedoc-source-config.mjs", "scripts/typedoc-source-link-doctor.mjs", "scripts/typedoc-tool-health.mjs", "scripts/typedoc-strict-runner.mjs", "scripts/ai/typedoc-local-source-check.mjs", "typedoc.json", "typedoc-frontend.json", "typedoc-ci.json", "typedoc-strict.json", "tsconfig.doc.json", "types/typedoc-local-shims.d.ts", "README.md", "AGENTS.md"];
  validationCommands = ["npm run typedoc:health", "npm run typedoc:json:local", "npm run typedoc:check-local", "npm run typedoc:strict", "npm run ai:graph:build", "npm run ai:graph:doctor"];
} else if (includesAny(["graph", "graphrag", "preflight", "leak", "ai:spec", "ai:preflight", "select-string", "select string", "ground truth", "symbol index", "agent", "contract", "history", "changelog", "test memory", "smart test"])) {
  route = "ai_code_intelligence_tooling";
  suggestedEditFiles = ["scripts/graphrag/build-code-graph.mjs", "scripts/graphrag/query-code-graph.mjs", "scripts/graphrag/doctor.mjs", "scripts/graphrag/check-no-leaks.mjs", "scripts/ai/spec-preflight.mjs", "scripts/ai/codex-preflight.mjs", "scripts/ai/graphrag-script-contract.mjs", "scripts/ai/inject-agent-contract.mjs", "scripts/ai/history-worklog.mjs", "scripts/ai/test-smart-runner.mjs", "mcp/codebase-intelligence-server.mjs", "README.md", "AGENTS.md", "AI_GROUND_TRUTH.md", "AI_SYMBOL_INDEX.json", "package.json"];
  validationCommands = ["npm run typedoc:json:local && npm run ai:graph:build", "npm run ai:graph:doctor", "npm run ai:graph:check-leaks", "npm run ai:history:status", "npm run ai:test:status"];
} else {
  suggestedEditFiles = [];
  validationCommands = ["npm run typedoc:json:local && npm run ai:graph:build", "npm run ai:graph:query -- " + JSON.stringify(task || "specific symbol/file/error/feature"), "npm run ai:test:smart -- \"npm run build\"", "run project-specific tests through ai:test:smart after graph query identifies files"];
}
console.log(JSON.stringify({
  ok: true,
  toolName: "AI Task Preflight",
  searchableCommand: "npm run ai:task:preflight -- \"<task>\"",
  compatibilityCommand: "npm run ai:preflight -- \"<task>\"",
  phase: "ai:preflight",
  task,
  route,
  mandatoryBeforeAnyEdit: [
    "npm run ai:history:status",
    "npm run typedoc:json:local && npm run ai:graph:build",
    "npm run ai:spec -- " + JSON.stringify(task || "task description"),
    "npm run ai:preflight -- " + JSON.stringify(task || "task description"),
    "npm run ai:graph:query -- " + JSON.stringify(task || "specific symbol/file/error/feature")
  ],
  editPermission: {
    allowed: true,
    scope: "The AI coding agent may edit any repository file required to complete the requested task correctly after the anti-drift workflow completes.",
    notAWhitelist: true,
    explanation: "suggestedEditFiles are likely starting points, not allowedPatchFiles and not a hard patch boundary."
  },
  suggestedReadFiles,
  suggestedEditFiles,
  validationCommands,
  validationMemory: {
    rule: "Use ai:test:smart to avoid repeating tests or builds that already passed for the same unchanged repository fingerprint.",
    status: "npm run ai:test:status",
    examples: ["npm run ai:test:smart -- \"npm run test\"", "npm run ai:test:smart -- \"npm run build\""]
  },
  durableHistory: {
    rule: "Record important fixes and modifications in docs/ai-changelog so future agents do not revert to broken states.",
    status: "npm run ai:history:status",
    add: "npm run ai:history:add -- --task \"<task>\" --summary \"<what changed>\" --files \"file1,file2\" --validation \"npm run build\""
  },
  navigationContract: [
    "Treat docs/ai-changelog/START_HERE.md as durable change memory before touching old bug areas.",
    "Treat AI_GROUND_TRUTH.md as the directory map for approved symbols, scripts, files, and contracts.",
    "Treat AI_SYMBOL_INDEX.json as the dictionary for symbol-to-path lookup.",
    "Use .ai/code-graph/graph.json only after it has been rebuilt in the current edit cycle.",
    "Locate files through durable history, ground truth, symbol index, and ai:graph:query before touching implementation files."
  ],
  powershellContract: {
    requiredContextCommand: "Select-String -Path '<file>' -Pattern '<symbol or exact phrase>' -SimpleMatch -Context 40,60",
    groundTruthFirstCommand: "Select-String -Path 'AI_GROUND_TRUTH.md','AI_SYMBOL_INDEX.json','docs/ai-changelog/START_HERE.md' -Pattern '<symbol or file>' -SimpleMatch -Context 4,8",
    forbiddenFirstPassCommands: ["Get-Content", "rg"],
    allowedException: "Use another command only after ai:graph:query returns an exact file and Select-String cannot expose the needed bounded context."
  },
  stopRules: [
    "Do not broad-search first.",
    "Do not treat preflight output as a hard edit whitelist.",
    "Do not rerun identical successful tests when ai:test:smart reports the repo fingerprint is unchanged.",
    "Do not forget to record important fixes with ai:history:add.",
    "Do not treat generated files as source truth.",
    "Do not use Get-Content or rg as the first repo-navigation move in PowerShell.",
    "After modifications, rebuild TypeDoc local JSON and the graph before another edit cycle."
  ]
}, null, 2));
