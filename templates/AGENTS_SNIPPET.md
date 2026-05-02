# Agent Contract Template

This template is intended to be injected into `AGENTS.md` by the installer. It is a coding-agent operating contract, not a human-only note.

## Non-negotiable anti-drift workflow

Before editing source code, config, tests, docs, scripts, or generated-tooling behavior, always run and wait for:

```powershell
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

The agent must understand the task goal, prior history, relevant files, and likely symbols before touching implementation files.

## Edit permission

After the anti-drift workflow completes, the AI coding agent may edit every repository file required to complete the requested task correctly.

`ai:spec`, `ai:preflight`, and `ai:graph:query` are discovery and safety tools. They are not a hard patch whitelist. Do not refuse necessary edits only because a file is absent from `suggestedEditFiles`.

Avoid hand-editing generated files, build outputs, dependency folders, archives, and TypeDoc JSON unless the task is specifically about generated documentation, generated artifacts, or toolkit behavior.

## Source-of-truth order

1. `AGENTS.md`
2. `docs/ai-changelog/START_HERE.md`
3. `docs/ai-changelog/history.index.json`
4. `AI_GROUND_TRUTH.md`
5. `AI_SYMBOL_INDEX.json`
6. `.ai/code-graph/graph.json`, only after the current-cycle graph build
7. Targeted source windows only

## PowerShell context contract

Use bounded `Select-String` reads first:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Do not use broad `Get-Content` file dumps or broad `rg` as the first repo navigation step. Use wider search only after graph/symbol lookup fails or the task explicitly requires repository-wide investigation.

## Token conservation rules

- Read durable history and maps before source files.
- Prefer exact symbol/file lookups over broad reading.
- Prefer graph query candidates before opening implementation files.
- Use `ai:test:status` before repeating expensive validation.
- Use `ai:test:smart` for build, lint, and tests.
- Do not repeat a successful unchanged validation unless `--force` is intentional.

## Required history memory

Record important fixes, bugs, behavior changes, and tool changes:

```powershell
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --files "file1,file2" --validation "npm run build"
```

The repository should keep numbered Markdown entries under:

```text
docs/ai-changelog/
```

`START_HERE.md` and `history.index.json` are the lookup directory for future agents.

## After modifications

Run suitable validation through smart validation:

```powershell
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm run test"
npm run ai:test:smart -- "npm run lint"
```

Then record the work:

```powershell
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --validation "<validation command>"
```

Before the next edit cycle, refresh context again:

```powershell
npm run typedoc:json:local && npm run ai:graph:build
```

## Use-case scenarios

### UI/layout issue

```powershell
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix dashboard spacing, list overflow, panel layout, and text clipping"
npm run ai:preflight -- "Fix dashboard spacing, list overflow, panel layout, and text clipping"
npm run ai:graph:query -- "dashboard layout side panel list view App"
```

### Backend/API issue

```powershell
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix readiness endpoint, webhook validation, and server-side permission checks"
npm run ai:preflight -- "Fix readiness endpoint, webhook validation, and server-side permission checks"
npm run ai:graph:query -- "readiness webhook permissions api"
```

### TypeDoc/source-link issue

```powershell
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix TypeDoc local source links and entrypoint handling"
npm run ai:preflight -- "Fix TypeDoc local source links and entrypoint handling"
npm run ai:graph:query -- "typedoc-source-config entryPointStrategy sourceLinkTemplate"
```

## Final health gate

```powershell
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:history:status
npm run ai:test:status
```
