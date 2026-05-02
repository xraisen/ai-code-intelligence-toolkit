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

## Agent contract injection

- `scripts/ai/inject-agent-contract.mjs` repairs and reinjects the managed AGENTS.md and README.md anti-drift contract.
- `npm run ai:inject-contract` must leave no Git conflict markers in managed instructions.
- The injected contract includes use-case examples for UI/layout, backend/API, known-symbol, and database/RLS work.


## v1.0.8 Final Drift-Hardened Additions

### Durable history / AI memory

- `docs/ai-changelog/START_HERE.md` is the first lookback document for prior fixes.
- `docs/ai-changelog/history.index.json` is the machine-readable index of numbered fixes.
- `scripts/ai/history-worklog.mjs` creates and refreshes numbered changelog entries.
- Commands:
  - `npm run ai:history:init`
  - `npm run ai:history:status`
  - `npm run ai:history:add -- --task "<task>" --summary "<what changed>"`
  - `npm run ai:history:refresh`

### Smart validation memory

- `scripts/ai/test-smart-runner.mjs` prevents repeated validation runs when the same command already passed for the unchanged repository fingerprint.
- Commands:
  - `npm run ai:test:status`
  - `npm run ai:test:smart -- "npm run test"`
  - `npm run ai:test:smart -- "npm run build"`

### Cross-platform strict TypeDoc

- `scripts/typedoc-strict-runner.mjs` replaces shell-specific inline environment assignment.
- Use `npm run typedoc:strict` on Windows, macOS, or Linux.
