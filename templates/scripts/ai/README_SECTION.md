## AI Code Intelligence Toolkit

This repository uses AI Code Intelligence Toolkit with TypeDoc Hybrid Source Links to keep AI coding agents from drifting across the wrong files, stale docs, generated output, or broad repository scans.

### Install/update

```bash
npm install --save-dev typedoc-hybrid-source-links ai-code-intelligence-toolkit typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite --strict
npm run ai:inject-contract
```

The installer injects a managed contract into `AGENTS.md` and this README. It replaces old generated sections, repairs corrupted generated sections that contain Git conflict markers, and preserves project-specific content outside the managed block.

### Mandatory anti-drift workflow before edits

Always run the refresh command first and wait for it to finish:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then run:

```bash
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

`AI_GROUND_TRUTH.md` is the directory and contract map. `AI_SYMBOL_INDEX.json` is the symbol dictionary. `.ai/code-graph/graph.json` is valid only after the graph is rebuilt in the current cycle.

### Edit permission

The contract does not block the AI coding agent from editing. After the anti-drift workflow finishes, the agent may edit any repository file required to complete the task correctly.

`ai:spec`, `ai:preflight`, and `ai:graph:query` are discovery and safety tools. They guide context selection but do not limit which necessary files can be edited.

The agent should still avoid hand-editing generated files, build outputs, archives, dependency folders, and TypeDoc JSON unless the task is specifically about those generated/tooling outputs.

### PowerShell context rule

Use `Select-String` for bounded context before source edits:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Do not use broad `Get-Content` dumps or `rg` as the first navigation move.

### Use-case examples

#### UI/layout fix

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix dashboard spacing, list view overflow, panel colors, and text clipping"
npm run ai:preflight -- "Fix dashboard spacing, list view overflow, panel colors, and text clipping"
npm run ai:graph:query -- "dashboard layout list view panel App"
```

#### Backend/API fix

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix readiness endpoint, webhook validation, and server-side permission checks"
npm run ai:preflight -- "Fix readiness endpoint, webhook validation, and server-side permission checks"
npm run ai:graph:query -- "readiness webhook permissions api"
```

#### Known symbol/file/error fix

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix the exact error without broad repo scanning"
npm run ai:preflight -- "Fix the exact error without broad repo scanning"
npm run ai:graph:query -- "<specific symbol/file/error>"
```

### Searchable command aliases

| Purpose | Compatibility command | Searchable alias |
|---|---|---|
| Refresh TypeDoc JSON and graph | `npm run typedoc:json:local && npm run ai:graph:build` | `npm run ai:context:refresh` |
| Task spec | `npm run ai:spec -- "<task>"` | `npm run ai:task:spec -- "<task>"` |
| Task preflight | `npm run ai:preflight -- "<task>"` | `npm run ai:task:preflight -- "<task>"` |
| Graph query | `npm run ai:graph:query -- "<query>"` | `npm run ai:context:find -- "<query>"` |
| Graph doctor | `npm run ai:graph:doctor` | `npm run ai:context:doctor` |
| Leak check | `npm run ai:graph:check-leaks` | `npm run ai:context:leak-check` |
| Contract injection | `npm run ai:inject-contract` | `npm run ai:contract:inject` |
| Final health | `npm run ai:final-health` | `npm run ai:health:final` |

### Final health gate

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```


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
