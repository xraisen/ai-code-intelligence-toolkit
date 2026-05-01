#!/usr/bin/env node
const task = process.argv.slice(2).join(" ").trim();
const lower = task.toLowerCase();
const route = lower.includes("typedoc") || lower.includes("docs") || lower.includes("source link")
  ? "typedoc_tooling"
  : lower.includes("graph") || lower.includes("graphrag")
    ? "graphrag_tooling"
    : "repo_task";
const taskText = task || "task description";
console.log(JSON.stringify({
  ok: true,
  phase: "ai:spec",
  task,
  route,
  mandatoryFirstRun: "npm run typedoc:json:local && npm run ai:graph:build",
  contract: [
    "Before source reads or edits, refresh local TypeDoc JSON and rebuild the graph: npm run typedoc:json:local && npm run ai:graph:build.",
    "Use AI_GROUND_TRUTH.md as the directory contract and AI_SYMBOL_INDEX.json as the symbol dictionary before touching source files.",
    "Use ai:graph:query for a specific symbol, route, file, error, feature, table, validator, or hook before opening implementation files.",
    "Use ai:preflight before patching and patch only files returned by allowedPatchFiles unless a new preflight expands scope.",
    "On Windows PowerShell, use targeted Select-String lookups for context. Do not use broad Get-Content or rg as the first-pass repo navigation method.",
    "After any modification, rerun npm run typedoc:json:local && npm run ai:graph:build before the next source-navigation or edit cycle."
  ],
  powershellContract: {
    use: "Select-String -Path '<file>' -Pattern '<specific symbol or phrase>' -SimpleMatch -Context 40,60",
    avoid: ["Get-Content for broad file dumps", "rg for broad repository search before graph/symbol lookup"],
    reason: "Select-String keeps reads bounded to the requested symbol or issue and prevents context drift."
  },
  examples: [
    {
      scenario: "Fix a bug in a known component or function",
      commands: [
        "npm run typedoc:json:local && npm run ai:graph:build",
        `npm run ai:spec -- ${JSON.stringify(taskText)}`,
        "npm run ai:graph:query -- \"specificFunctionName or src/path/file.ts\"",
        `npm run ai:preflight -- ${JSON.stringify(taskText)}`
      ]
    },
    {
      scenario: "Investigate a failing route, hook, validator, table, or API function",
      commands: [
        "npm run typedoc:json:local && npm run ai:graph:build",
        "npm run ai:spec -- \"investigate the failing behavior without editing yet\"",
        "npm run ai:graph:query -- \"route/hook/validator/table/error text\"",
        "npm run ai:preflight -- \"prepare the smallest safe patch after graph query\""
      ]
    }
  ],
  next: [
    "npm run typedoc:json:local && npm run ai:graph:build",
    `npm run ai:graph:query -- ${JSON.stringify(task || "specific symbol/file/error/feature")}`,
    `npm run ai:preflight -- ${JSON.stringify(taskText)}`
  ]
}, null, 2));
