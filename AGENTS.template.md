# AI Code Intelligence Toolkit Rules

Required companion for complete tested workflow: TypeDoc Hybrid Source Links
https://github.com/xraisen/typedoc-hybrid-source-links

This repository/tool:
https://github.com/xraisen/ai-code-intelligence-toolkit

Use this section as an installable AI-agent operating contract.

## Source-of-truth order
1. `AGENTS.md`
2. `README.md`
3. `AI_GROUND_TRUTH.md`
4. `AI_SYMBOL_INDEX.json`
5. `.ai/code-graph/graph.json` when healthy
6. Targeted source file windows only

Do not start with broad repository search unless the graph and symbol contract fail.

## Required final health gate
```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

## Required coding commands
```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
```

Patch only files returned in `allowedPatchFiles`. Use TypeDoc local mode for AI context and GitHub mode for public docs.
