# AI Code Intelligence Toolkit Agent Contract

This repository uses **AI Code Intelligence Toolkit** and **TypeDoc Hybrid Source Links**.

This contract is mandatory for AI coding agents. If a task conflicts with this contract, stop and explain the conflict instead of guessing.

---

## Required companion tools

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite --strict
```

---

## Non-negotiable anti-drift startup

Before reading implementation files, planning patches, or editing source code, always run and wait for:

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

Do not touch source files until the task goal is understood and the relevant files/symbols are located.

---

## Edit permission

After the anti-drift workflow completes, the AI coding agent may edit every repository file necessary to complete the task correctly.

`ai:spec`, `ai:preflight`, and `ai:graph:query` are discovery and safety tools. They are not hard edit whitelists.

Do not refuse to edit a required file only because it was not listed in preflight output.

---

## Source-of-truth order

Use this order before implementation reads:

1. `AGENTS.md`
2. `docs/ai-changelog/START_HERE.md`
3. `docs/ai-changelog/history.index.json`
4. `AI_GROUND_TRUTH.md`
5. `AI_SYMBOL_INDEX.json`
6. `.ai/code-graph/graph.json`, only after current-cycle graph build
7. Targeted source context windows

`AI_GROUND_TRUTH.md` is the repo directory and contract map.

`AI_SYMBOL_INDEX.json` is the symbol dictionary.

`docs/ai-changelog` is durable project memory. Check it before reopening old issues.

---

## PowerShell context contract

Use bounded `Select-String` reads before source edits:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Avoid broad first-pass reads:

```powershell
Get-Content <entire-large-file>
rg "vague query"
```

Use broader search only after graph/symbol lookup fails or the exact target area is known.

---

## Token conservation rules

- Start with durable history and symbol maps, not raw source dumps.
- Prefer exact symbol/file queries over broad repository scans.
- Use bounded context windows.
- Do not repeatedly run the same successful validation on the same unchanged repo state.
- Use `npm run ai:test:status` before repeating expensive tests.
- Use `npm run ai:test:smart -- "<command>"` for validation commands.

---

## Required validation memory

Before validation:

```bash
npm run ai:test:status
```

Run validations through:

```bash
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm run lint"
npm run ai:test:smart -- "npm test"
```

Do not rerun an unchanged passing validation unless there is a reason or `--force` is intentional.

---

## Required changelog memory

After important modifications, add a numbered memory entry:

```bash
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --files "file1,file2" --validation "npm run build"
```

Refresh if needed:

```bash
npm run ai:history:refresh
```

This prevents future agents from reverting fixed bugs or forgetting why changes were made.

---

## After modification

If modifications are made and another edit cycle is needed, rerun:

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

Before final commit:

```bash
npm run ai:final-health
```

---

## Common task scenarios

### UI/layout task

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix dashboard spacing, list overflow, side panel layout, and text clipping"
npm run ai:preflight -- "Fix dashboard spacing, list overflow, side panel layout, and text clipping"
npm run ai:graph:query -- "dashboard layout side panel list view App"
```

### Backend/API task

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix readiness endpoint and webhook validation"
npm run ai:preflight -- "Fix readiness endpoint and webhook validation"
npm run ai:graph:query -- "readiness endpoint webhook validation api"
```

### Known symbol/file task

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix <specific symbol> behavior"
npm run ai:preflight -- "Fix <specific symbol> behavior"
npm run ai:graph:query -- "<specific symbol>"
```

### Documentation/tooling task

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix TypeDoc source link generation"
npm run ai:preflight -- "Fix TypeDoc source link generation"
npm run ai:graph:query -- "typedoc-source-config sourceLinkTemplate entryPointStrategy"
```

---

## Generated and build outputs

Avoid hand-editing these unless the task specifically concerns generated docs/tooling:

```txt
node_modules/
dist/
docs/api-local/
typedoc-api.json
typedoc.local.generated.json
typedoc.github.generated.json
.ai/code-graph/graph.json
*.tgz
*.zip
```

Regenerate them through scripts instead.
