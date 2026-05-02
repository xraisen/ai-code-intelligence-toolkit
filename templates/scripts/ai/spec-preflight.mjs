#!/usr/bin/env node
const task = process.argv.slice(2).join(" ").trim();
const lower = task.toLowerCase();
const route = lower.includes("typedoc") || lower.includes("docs") || lower.includes("source link")
  ? "typedoc_tooling"
  : lower.includes("graph") || lower.includes("graphrag") || lower.includes("preflight") || lower.includes("agent") || lower.includes("contract") || lower.includes("changelog") || lower.includes("history")
    ? "ai_code_intelligence_tooling"
    : "repo_task";
const taskText = task || "task description";
console.log(JSON.stringify({
  ok: true,
  toolName: "AI Task Spec",
  searchableCommand: "npm run ai:task:spec -- \"<task>\"",
  compatibilityCommand: "npm run ai:spec -- \"<task>\"",
  phase: "ai:spec",
  task,
  route,
  mandatoryFirstRun: "npm run typedoc:json:local && npm run ai:graph:build",
  durableMemoryFirst: [
    "Read docs/ai-changelog/START_HERE.md if present.",
    "Check docs/ai-changelog/history.index.json before reopening an old issue.",
    "Run npm run ai:history:status to see prior numbered fixes."
  ],
  editPermission: {
    allowed: true,
    scope: "After the anti-drift workflow completes, the AI coding agent may edit every repository file required to complete the task correctly.",
    notAWhitelist: ["ai:spec", "ai:preflight", "ai:graph:query"],
    guardrail: "Avoid hand-editing generated files, build outputs, dependency folders, archives, and TypeDoc JSON unless the task is specifically about generated documentation or tooling."
  },
  contract: [
    "Always first refresh local TypeDoc JSON and rebuild the graph: npm run typedoc:json:local && npm run ai:graph:build.",
    "Then run npm run ai:spec -- \"<task>\", npm run ai:preflight -- \"<task>\", and npm run ai:graph:query -- \"<specific symbol/file/error/feature>\" before touching source files.",
    "Read docs/ai-changelog/START_HERE.md and history.index.json before working on areas with prior fixes.",
    "Use AI_GROUND_TRUTH.md as the directory contract and AI_SYMBOL_INDEX.json as the symbol dictionary before implementation reads.",
    "Use ai:graph:query for a specific symbol, route, file, error, feature, table, validator, or hook before opening implementation files.",
    "The preflight and graph outputs guide the work; they do not prohibit necessary edits outside surfaced candidates.",
    "On Windows PowerShell, use targeted Select-String lookups for context. Do not use broad Get-Content or rg as the first-pass repo navigation method.",
    "Use ai:test:smart for repeated validation. Do not rerun the same successful validation on the same unchanged fingerprint unless --force is intentional.",
    "After important changes, record the fix: npm run ai:history:add -- --task \"<task>\" --summary \"<what changed>\".",
    "After any modification, rerun npm run typedoc:json:local && npm run ai:graph:build before the next source-navigation or edit cycle."
  ],
  tokenConservation: [
    "Read AGENTS.md, docs/ai-changelog/START_HERE.md, AI_GROUND_TRUTH.md, and AI_SYMBOL_INDEX.json before source files.",
    "Prefer Select-String bounded context over whole-file dumps.",
    "Use graph query candidates, then exact symbol context windows.",
    "Use ai:test:status and ai:test:smart to avoid repeated identical tests."
  ],
  powershellContract: {
    use: "Select-String -Path '<file>' -Pattern '<specific symbol or phrase>' -SimpleMatch -Context 40,60",
    groundTruthFirst: "Select-String -Path 'AI_GROUND_TRUTH.md','AI_SYMBOL_INDEX.json','docs/ai-changelog/START_HERE.md' -Pattern '<symbol or file>' -SimpleMatch -Context 4,8",
    avoid: ["Get-Content for broad file dumps", "rg for broad repository search before graph/symbol lookup"],
    reason: "Select-String keeps reads bounded to the requested symbol or issue and prevents context drift."
  },
  examples: [
    {
      scenario: "Fix a UI/layout bug",
      commands: [
        "npm run typedoc:json:local && npm run ai:graph:build",
        "npm run ai:spec -- \"Fix dashboard spacing, list overflow, panel layout, and text clipping\"",
        "npm run ai:preflight -- \"Fix dashboard spacing, list overflow, panel layout, and text clipping\"",
        "npm run ai:graph:query -- \"dashboard layout side panel list view App\"",
        "npm run ai:test:smart -- \"npm run build\"",
        "npm run ai:history:add -- --task \"Fix dashboard layout\" --summary \"Adjusted layout and prevented text clipping\" --validation \"npm run build\""
      ]
    },
    {
      scenario: "Fix backend/API behavior",
      commands: [
        "npm run typedoc:json:local && npm run ai:graph:build",
        "npm run ai:spec -- \"Fix readiness endpoint, webhook validation, and server-side permission checks\"",
        "npm run ai:preflight -- \"Fix readiness endpoint, webhook validation, and server-side permission checks\"",
        "npm run ai:graph:query -- \"readiness webhook permissions api\"",
        "npm run ai:test:smart -- \"npm run test\""
      ]
    }
  ],
  next: [
    "npm run ai:history:status",
    "npm run typedoc:json:local && npm run ai:graph:build",
    `npm run ai:preflight -- ${JSON.stringify(taskText)}`,
    `npm run ai:graph:query -- ${JSON.stringify(task || "specific symbol/file/error/feature")}`
  ]
}, null, 2));
