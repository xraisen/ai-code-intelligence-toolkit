# AI Code Intelligence Toolkit Rules

Required companion for the complete tested workflow:

- TypeDoc Hybrid Source Links: https://github.com/xraisen/typedoc-hybrid-source-links
- AI Code Intelligence Toolkit: https://github.com/xraisen/ai-code-intelligence-toolkit

Install/update command:

```bash
npm install --save-dev typedoc-hybrid-source-links ai-code-intelligence-toolkit typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite --strict
npm run ai:inject-contract
```

## Non-negotiable anti-drift startup

Before reading implementation files, planning a patch, or editing source code, always run and wait for this command to finish:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then run the task contract in this exact order:

```bash
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

Do not touch source files until the task goal is understood and the relevant files/symbols are located.

## Edit permission contract

The AI coding agent is allowed to edit every repository file required to complete the requested task correctly after the anti-drift workflow above has completed.

`ai:spec`, `ai:preflight`, and `ai:graph:query` are discovery, planning, and safety tools. They guide context selection but do not limit which necessary files can be edited.

Do not refuse necessary edits only because a file is not listed by preflight or graph query. If a needed file was not surfaced, run a more specific `ai:graph:query` and continue with the smallest correct patch.

Generated files, build output, dependency folders, archives, and TypeDoc JSON should still not be edited by hand unless the task is specifically about generated documentation or tooling.

## Source-of-truth order

Use this order before editing:

1. `AGENTS.md`
2. `docs/00-START-HERE.md`, if present
3. `docs/23-CHANGELOG-ROADMAP.md`, if present
4. `AI_GROUND_TRUTH.md` as the directory and contract map
5. `AI_SYMBOL_INDEX.json` as the symbol dictionary
6. `.ai/code-graph/graph.json`, only after the current-cycle graph build is healthy
7. Targeted source file windows only

Do not start with broad repository search unless the graph and symbol contract fail.

## PowerShell context contract

When working in PowerShell, use targeted `Select-String` context reads before source edits:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Do not use broad `Get-Content` file dumps or `rg` as the first navigation move.

Use another command only after `ai:graph:query` returns an exact file and `Select-String` cannot expose the needed bounded context.

## Required use-case scenarios

### Scenario 1: UI/layout bug fix

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix dashboard spacing, list view overflow, side panel layout, text clipping, and color consistency"
npm run ai:preflight -- "Fix dashboard spacing, list view overflow, side panel layout, text clipping, and color consistency"
npm run ai:graph:query -- "dashboard layout side panel list view spacing App"
```

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "App" -SimpleMatch -Context 4,8
Select-String -Path "src/App.tsx" -Pattern "side panel" -SimpleMatch -Context 40,60
```

### Scenario 2: backend/API bug fix

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix backend readiness endpoint, webhook validation, and Supabase-safe server checks"
npm run ai:preflight -- "Fix backend readiness endpoint, webhook validation, and Supabase-safe server checks"
npm run ai:graph:query -- "api health webhook supabase readiness"
```

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "api" -SimpleMatch -Context 4,8
Select-String -Path "api/health.ts" -Pattern "readiness" -SimpleMatch -Context 40,60
```

### Scenario 3: known symbol, route, hook, error, or file

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Investigate and fix the named symbol without broad repo search"
npm run ai:preflight -- "Investigate and fix the named symbol without broad repo search"
npm run ai:graph:query -- "<exact symbol/file/route/error>"
```

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "<exact symbol/file/route/error>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<exact symbol/file/route/error>" -SimpleMatch -Context 40,60
```

### Scenario 4: database, auth, RLS, or permissions change

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Implement role-based access, RLS-safe data flow, audit logging, and server-checked permissions"
npm run ai:preflight -- "Implement role-based access, RLS-safe data flow, audit logging, and server-checked permissions"
npm run ai:graph:query -- "roles users access audit supabase RLS permissions"
```

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "supabase" -SimpleMatch -Context 4,8
Select-String -Path "src/api/client.ts" -Pattern "permission" -SimpleMatch -Context 40,60
```

## Searchable tool names

Use the compatibility commands when existing automation expects them, or the searchable aliases when instructing agents:

| Purpose | Compatibility command | Searchable alias |
|---|---|---|
| Refresh context before edits | `npm run typedoc:json:local && npm run ai:graph:build` | `npm run ai:context:refresh` |
| Generate task spec | `npm run ai:spec -- "<task>"` | `npm run ai:task:spec -- "<task>"` |
| Generate execution preflight | `npm run ai:preflight -- "<task>"` | `npm run ai:task:preflight -- "<task>"` |
| Find symbol/file context | `npm run ai:graph:query -- "<query>"` | `npm run ai:context:find -- "<query>"` |
| Check graph health | `npm run ai:graph:doctor` | `npm run ai:context:doctor` |
| Check generated-file leaks | `npm run ai:graph:check-leaks` | `npm run ai:context:leak-check` |
| Inject/repair AGENTS and README contract | `npm run ai:inject-contract` | `npm run ai:contract:inject` |
| Final validation | `npm run ai:final-health` | `npm run ai:health:final` |



## Durable AI changelog and lookback memory

Before reopening a bug area or changing code that may have been fixed before, check:

```bash
npm run ai:history:status
```

Then read:

```txt
docs/ai-changelog/START_HERE.md
docs/ai-changelog/history.index.json
```

After any important bug fix, feature change, tooling change, migration, or behavior correction, record it:

```bash
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --files "file1,file2" --validation "npm run build"
```

This creates a numbered markdown entry in `docs/ai-changelog/` and refreshes the machine-readable index. Future AI agents must use this memory to avoid reverting to older broken states.

## Smart validation memory

Do not repeat the same expensive test/build if it already passed for the same unchanged repository fingerprint.

Use:

```bash
npm run ai:test:status
npm run ai:test:smart -- "npm run test"
npm run ai:test:smart -- "npm run build"
```

`ai:test:smart` runs the command when the repo fingerprint changed, when the previous run failed, or when there is no previous pass. It skips only when the exact same command already passed against the same unchanged fingerprint.

## Token conservation checklist

1. Read `AGENTS.md` and `docs/ai-changelog/START_HERE.md` first.
2. Use `AI_GROUND_TRUTH.md` and `AI_SYMBOL_INDEX.json` as directory and dictionary.
3. Run `npm run typedoc:json:local && npm run ai:graph:build` before source reads.
4. Use `ai:graph:query` to locate exact files/symbols.
5. In PowerShell, use `Select-String` bounded context instead of broad `Get-Content` or `rg` first.
6. Use `ai:test:smart` instead of repeating identical validations.
7. Save important fixes with `ai:history:add`.

## Required final health gate

After modifications, run:

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:history:status
npm run ai:test:status
```

If modifications are made and another edit cycle is needed, rerun:

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
```

Use TypeDoc local mode for AI context and GitHub mode for public docs.
