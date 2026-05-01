# AI Ground Truth

This file is the source-of-truth navigation map for AI-assisted coding.

## Mandatory anti-drift contract

Before source reads or edits, always run and wait for this command to finish:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then run:

```bash
npm run ai:spec -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
npm run ai:preflight -- "<task>"
```

Use this file as the directory/map for approved scripts and contracts. Use `AI_SYMBOL_INDEX.json` as the dictionary for symbol-to-path lookup. Use `.ai/code-graph/graph.json` only after it has been rebuilt in the current work cycle.

## PowerShell context contract

Use targeted `Select-String` before source edits:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Do not use broad `Get-Content` file dumps or `rg` as the first navigation move. Use another command only after `ai:graph:query` returns an exact file and `Select-String` cannot expose the needed bounded context.

## Required workflow symbols

- symbol: `ai:spec`
  path: `scripts/ai/spec-preflight.mjs`
  contract: create task scope before source edits
- symbol: `ai:preflight`
  path: `scripts/ai/codex-preflight.mjs`
  contract: return allowed read files, allowed patch files, validation commands, and stop rules
- symbol: `ai:graph:build`
  path: `scripts/graphrag/build-code-graph.mjs`
  contract: build `.ai/code-graph/graph.json`
- symbol: `ai:graph:query`
  path: `scripts/graphrag/query-code-graph.mjs`
  contract: locate exact files and Select-String bounded context commands
- symbol: `ai:graph:doctor`
  path: `scripts/graphrag/doctor.mjs`
  contract: verify graph, scripts, source-truth files, and TypeDoc local link mode
- symbol: `ai:graph:check-leaks`
  path: `scripts/graphrag/check-no-leaks.mjs`
  contract: block generated/build/archive/mobile-public files from graph truth
- symbol: `typedoc:json:local`
  path: `scripts/typedoc-source-config.mjs`
  contract: generate local TypeDoc JSON before graph build and AI source navigation

Add project-specific symbols here after installing the toolkit.
