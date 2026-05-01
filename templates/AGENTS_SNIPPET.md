# AI Code Intelligence Toolkit Rules

Required companion for complete tested workflow: TypeDoc Hybrid Source Links
https://github.com/xraisen/typedoc-hybrid-source-links

This repository/tool:
https://github.com/xraisen/ai-code-intelligence-toolkit

## Non-negotiable anti-drift startup

Before reading implementation files, planning a patch, or editing source code, run and wait for this command to finish:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then run the task contract in this order:

```bash
npm run ai:spec -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
npm run ai:preflight -- "<task>"
```

Do not touch source files until the specific files and symbols are located.

## Source-of-truth order

1. `AGENTS.md`
2. `README.md`
3. `AI_GROUND_TRUTH.md` as the directory/map of approved scripts, files, and contracts
4. `AI_SYMBOL_INDEX.json` as the dictionary for symbol-to-path lookup
5. `.ai/code-graph/graph.json` only after the current-cycle graph build is healthy
6. Targeted source file windows only

Do not start with broad repository search unless the graph and symbol contract fail.

## PowerShell context contract

When working in PowerShell, use targeted `Select-String` context reads before source edits:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Do not use broad `Get-Content` file dumps or `rg` as the first navigation move. Use another command only after `ai:graph:query` returns an exact file and `Select-String` cannot expose the needed bounded context.

## Required final health gate

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

If modifications are made, rerun:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then rerun `ai:spec`, `ai:graph:query`, and `ai:preflight` before the next edit cycle.

Patch only files returned in `allowedPatchFiles`. Use TypeDoc local mode for AI context and GitHub mode for public docs.
