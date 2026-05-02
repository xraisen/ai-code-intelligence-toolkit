# AI Code Intelligence Toolkit v1.0.8

AI code intelligence toolkit with anti-drift task contracts, graph queries, TypeDoc source-link support, agent-safe install injection, smart validation memory, and durable AI changelog tracking.

## Install

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite --strict
npm run ai:history:init
```

## Required anti-drift edit cycle

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

The agent may edit every necessary repository file after this discovery flow completes. Preflight and graph query are guidance tools, not a hard edit whitelist.

## Token conservation and drift prevention

- Read `AGENTS.md`, `docs/ai-changelog/START_HERE.md`, `AI_GROUND_TRUTH.md`, and `AI_SYMBOL_INDEX.json` before source files.
- Use `Select-String` bounded context in PowerShell instead of broad `Get-Content` or `rg` first.
- Use `ai:test:smart` so a build/test that already passed for the same unchanged fingerprint is not repeated.
- Use `ai:history:add` so important fixes are recorded as numbered markdown files in `docs/ai-changelog/`.

## New v1.0.8 final commands

```bash
npm run ai:history:init
npm run ai:history:status
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --files "file1,file2" --validation "npm run build"
npm run ai:test:status
npm run ai:test:smart -- "npm run test"
npm run ai:test:smart -- "npm run build"
npm run typedoc:strict
```

## Example workflow

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix dashboard list overflow and side panel spacing"
npm run ai:preflight -- "Fix dashboard list overflow and side panel spacing"
npm run ai:graph:query -- "dashboard list overflow side panel App"
npm run ai:test:smart -- "npm run build"
npm run ai:history:add -- --task "Fix dashboard list overflow" --summary "Resolved side panel overflow and text clipping" --files "src/App.tsx" --validation "npm run build"
```

## Searchable aliases

| Purpose | Command |
|---|---|
| Refresh context | `npm run ai:context:refresh` |
| Find context | `npm run ai:context:find -- "<query>"` |
| Spec | `npm run ai:task:spec -- "<task>"` |
| Preflight | `npm run ai:task:preflight -- "<task>"` |
| Durable history | `npm run ai:history:status` |
| Smart validation | `npm run ai:test:smart -- "npm run build"` |
| Final health | `npm run ai:health:final` |

## Companion package

Install with TypeDoc Hybrid Source Links for the complete tested workflow:

```bash
npm install --save-dev typedoc-hybrid-source-links ai-code-intelligence-toolkit typedoc
```
## Cumulative v1.0.8 note

This package is the complete v1.0.8 jump release. It carries the package manifest repair, anti-drift agent contract, AGENTS/README injector, edit-permission fix, searchable aliases, durable AI changelog memory, and smart validation memory in one release.

