#!/usr/bin/env node
/** Single source of truth for AI code intelligence install files and package scripts. */
export const AI_INTELLIGENCE_REQUIRED_SCRIPTS = Object.freeze({
  "ai:spec": "node scripts/ai/spec-preflight.mjs",
  "ai:preflight": "node scripts/ai/codex-preflight.mjs",
  "ai:graph:build": "node scripts/graphrag/build-code-graph.mjs --fast",
  "ai:graph:build:fast": "node scripts/graphrag/build-code-graph.mjs --fast",
  "ai:graph:build:minimal": "node scripts/graphrag/build-code-graph.mjs --minimal",
  "ai:graph:build:full": "node scripts/graphrag/build-code-graph.mjs --full --include-tests",
  "ai:graph:query": "node scripts/graphrag/query-code-graph.mjs",
  "ai:graph:doctor": "node scripts/graphrag/doctor.mjs",
  "ai:graph:check-leaks": "node scripts/graphrag/check-no-leaks.mjs",
  "ai:graph:health": "npm run ai:graph:build && npm run ai:graph:doctor && npm run ai:graph:check-leaks",
  "mcp:code-intel": "node mcp/codebase-intelligence-server.mjs",
  "typedoc:config:auto": "node scripts/typedoc-source-config.mjs auto typedoc.json",
  "typedoc:config:local": "node scripts/typedoc-source-config.mjs local typedoc.json",
  "typedoc:config:github": "node scripts/typedoc-source-config.mjs github typedoc.json",
  "typedoc:frontend:config:local": "node scripts/typedoc-source-config.mjs local typedoc-frontend.json",
  "typedoc:frontend:config:github": "node scripts/typedoc-source-config.mjs github typedoc-frontend.json",
  "typedoc:json": "npm run typedoc:json:auto",
  "typedoc:json:auto": "npm run typedoc:config:auto && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --json typedoc-api.json --options typedoc.auto.generated.json",
  "typedoc:json:local": "npm run typedoc:config:local && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --json typedoc-api.json --options typedoc.local.generated.json",
  "typedoc:json:github": "npm run typedoc:config:github && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --json typedoc-api.github.json --options typedoc.github.generated.json",
  "typedoc:html:auto": "npm run typedoc:config:auto && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --options typedoc.auto.generated.json",
  "typedoc:html:local": "npm run typedoc:config:local && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --options typedoc.local.generated.json",
  "typedoc:html:github": "npm run typedoc:config:github && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --options typedoc.github.generated.json",
  "typedoc:frontend:html:github": "npm run typedoc:frontend:config:github && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --options typedoc-frontend.github.generated.json",
  "typedoc:health": "node scripts/typedoc-tool-health.mjs",
  "typedoc:doctor": "node scripts/typedoc-tool-health.mjs",
  "typedoc:check-local": "node scripts/ai/typedoc-local-source-check.mjs",
  "typedoc:strict": "TYPEDOC_STRICT=true node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --options typedoc-strict.json",
  "docs:typedoc": "npm run typedoc:html:auto"
});
export const AI_INTELLIGENCE_REQUIRED_FILES = Object.freeze({ agents:"AGENTS.md", readme:"README.md", groundTruth:"AI_GROUND_TRUTH.md", symbolIndex:"AI_SYMBOL_INDEX.json", graphBuilder:"scripts/graphrag/build-code-graph.mjs", graphQuery:"scripts/graphrag/query-code-graph.mjs", graphDoctor:"scripts/graphrag/doctor.mjs", graphLeakCheck:"scripts/graphrag/check-no-leaks.mjs", specPreflight:"scripts/ai/spec-preflight.mjs", codexPreflight:"scripts/ai/codex-preflight.mjs", scriptContract:"scripts/ai/graphrag-script-contract.mjs", typedocSourceConfig:"scripts/typedoc-source-config.mjs", typedocSourceLinkDoctor:"scripts/typedoc-source-link-doctor.mjs", typedocToolHealth:"scripts/typedoc-tool-health.mjs", typedocLocalCheck:"scripts/ai/typedoc-local-source-check.mjs", mcpCodeIntel:"mcp/codebase-intelligence-server.mjs", typedocConfig:"typedoc.json", typedocTsconfig:"tsconfig.doc.json" });
export const AI_INTELLIGENCE_REQUIRED_SCRIPT_NAMES = Object.freeze(Object.keys(AI_INTELLIGENCE_REQUIRED_SCRIPTS));
export function getRequiredGraphRagScripts(){return {...AI_INTELLIGENCE_REQUIRED_SCRIPTS};}
export function getRequiredGraphRagFiles(){return {...AI_INTELLIGENCE_REQUIRED_FILES};}
export const GRAPH_RAG_REQUIRED_SCRIPT_NAMES = AI_INTELLIGENCE_REQUIRED_SCRIPT_NAMES;
