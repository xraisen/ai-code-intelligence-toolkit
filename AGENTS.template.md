# AI Code Intelligence Toolkit Rules

Use this section as an installable AI-agent operating contract.

## Source-of-truth order
1. `AGENTS.md`
2. `README.md`
3. `AI_GROUND_TRUTH.md`
4. `AI_SYMBOL_INDEX.json`
5. `.ai/code-graph/graph.json` when healthy
6. Targeted source file windows only

Do not start with broad repository search unless the graph and symbol contract fail.

## TypeDoc prerequisite

Use [typedoc-hybrid-source-links](https://github.com/xraisen/typedoc-hybrid-source-links) in the target repository when source-link quality matters. It is the prerequisite that makes local VS Code links and public GitHub links behave correctly.

## Required commands
```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
```

Patch only files returned in `allowedPatchFiles`. Use TypeDoc local mode for AI context and GitHub mode for public docs.
