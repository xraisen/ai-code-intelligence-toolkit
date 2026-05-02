# AI Code Intelligence Toolkit

**AI Code Intelligence Toolkit** is a repo-local navigation, anti-drift, validation-memory, and agent-contract toolkit for AI-assisted coding workflows.

It gives coding agents a repeatable operating system before they edit code:

1. refresh TypeDoc JSON and the local code graph,
2. generate a task spec,
3. run preflight,
4. query the exact symbol/file/error/feature,
5. use bounded context reads instead of full-file dumps,
6. validate without repeating unchanged tests,
7. record important changes into durable numbered project history.

The goal is simple: **make AI coding agents less random, less wasteful, and less likely to drift back into old broken states.**

---

## Package

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
```

Install into a repo:

```bash
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite --strict
npm run ai:history:init
npm run ai:inject-contract
```

Check installed version:

```bash
npm view ai-code-intelligence-toolkit version
npm ls ai-code-intelligence-toolkit
```

Expected latest release:

```txt
1.0.9
```

---

## Companion package

This toolkit is designed to work with:

- **TypeDoc Hybrid Source Links**
- NPM package: `typedoc-hybrid-source-links`
- GitHub repository: `https://github.com/xraisen/typedoc-hybrid-source-links`

Install both together:

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
```

---

## What it installs

The installer injects repo-local scripts, docs, and contracts.

```txt
AGENTS.md
README.md
AI_GROUND_TRUTH.md
AI_SYMBOL_INDEX.json
.ai/code-graph/graph.json
scripts/ai/spec-preflight.mjs
scripts/ai/codex-preflight.mjs
scripts/ai/inject-agent-contract.mjs
scripts/ai/history-worklog.mjs
scripts/ai/test-smart-runner.mjs
scripts/graphrag/build-code-graph.mjs
scripts/graphrag/query-code-graph.mjs
scripts/graphrag/doctor.mjs
scripts/graphrag/check-no-leaks.mjs
docs/ai-changelog/START_HERE.md
docs/ai-changelog/history.index.json
mcp/codebase-intelligence-server.mjs
```

It also installs or updates TypeDoc support scripts through the companion package.

---

## Core workflow

Before any AI coding task, run:

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

After changes:

```bash
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm run test"
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --files "file1,file2" --validation "npm run build"
```

Before committing:

```bash
npm run ai:final-health
```

---

## Why this exists

AI coding agents often fail in predictable ways:

| Problem | Toolkit response |
|---|---|
| Reads too much context and loses the task | Uses graph and symbol-first navigation |
| Edits based on guessed file paths | Uses `AI_GROUND_TRUTH.md`, `AI_SYMBOL_INDEX.json`, and `.ai/code-graph/graph.json` |
| Reopens old fixed bugs | Reads `docs/ai-changelog/START_HERE.md` and `history.index.json` first |
| Repeats expensive tests | Uses `ai:test:smart` and validation fingerprints |
| Refuses to edit because preflight missed a file | Contract allows editing every necessary file after discovery |
| Uses broad PowerShell dumps | Requires targeted `Select-String` bounded context |
| Commits generated/build artifacts as source truth | Runs graph leak checks |

---

## Anti-drift contract

The installed `AGENTS.md` contract requires this order:

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

The agent must locate relevant files and understand the task before touching code.

After that workflow completes, the AI coding agent **may edit every repository file necessary to complete the task correctly**.

`ai:spec`, `ai:preflight`, and `ai:graph:query` are discovery tools. They are **not** a hard edit whitelist.

---

## PowerShell bounded context rule

For Windows/PowerShell workflows, the contract prefers `Select-String` over broad dumps:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Avoid broad first-pass navigation:

```powershell
Get-Content entire-large-file.tsx
rg "random vague search"
```

Use `rg` or broader reads only after graph/symbol lookup fails or after the exact target area is known.

---

## Durable AI changelog memory

The toolkit creates:

```txt
docs/ai-changelog/START_HERE.md
docs/ai-changelog/history.index.json
docs/ai-changelog/001-example-entry.md
```

Add a new worklog entry:

```bash
npm run ai:history:add -- --task "Fix dashboard layout" --summary "Adjusted side panel spacing and prevented list overflow." --files "src/App.tsx,src/professional-polish.css" --validation "npm run build"
```

Check memory:

```bash
npm run ai:history:status
```

Refresh the index:

```bash
npm run ai:history:refresh
```

This is meant to prevent future agents from reverting already-fixed bugs in long-running repos with hundreds or thousands of commits.

---

## Smart validation memory

Run validations through the smart runner:

```bash
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm run lint"
npm run ai:test:smart -- "npm test"
```

Check validation memory:

```bash
npm run ai:test:status
```

The smart runner tracks command + repository fingerprint. If the same validation already passed on the same unchanged state, the agent can avoid repeating it unless `--force` is intentional.

---

## Searchable command names

Compatibility commands remain available, but v1.0.9 also includes easier aliases.

| Purpose | Command |
|---|---|
| Refresh local context | `npm run ai:context:refresh` |
| Find related code context | `npm run ai:context:find -- "<query>"` |
| Check graph health | `npm run ai:context:doctor` |
| Check source leaks | `npm run ai:context:leak-check` |
| Create task spec | `npm run ai:task:spec -- "<task>"` |
| Run task preflight | `npm run ai:task:preflight -- "<task>"` |
| Inject contract | `npm run ai:contract:inject` |
| Repair contract | `npm run ai:contract:repair` |
| Final health | `npm run ai:health:final` |
| History status | `npm run ai:history:status` |
| Add history entry | `npm run ai:history:add -- --task "<task>" --summary "<summary>"` |
| Smart validation | `npm run ai:test:smart -- "npm run build"` |

---

## Use-case examples

### 1. UI/layout fix

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix dashboard spacing, list overflow, side panel layout, and text clipping"
npm run ai:preflight -- "Fix dashboard spacing, list overflow, side panel layout, and text clipping"
npm run ai:graph:query -- "dashboard layout side panel list view App professional polish"
```

PowerShell context:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json" -Pattern "dashboard layout" -SimpleMatch -Context 4,8
Select-String -Path "src/App.tsx","src/professional-polish.css" -Pattern "side-panel" -SimpleMatch -Context 40,60
```

Validate:

```bash
npm run ai:test:smart -- "npm run build"
npm run ai:history:add -- --task "Fix dashboard layout" --summary "Adjusted spacing and side panel behavior." --files "src/App.tsx,src/professional-polish.css" --validation "npm run build"
```

### 2. Backend/API fix

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix readiness endpoint and webhook validation"
npm run ai:preflight -- "Fix readiness endpoint and webhook validation"
npm run ai:graph:query -- "readiness endpoint webhook validation api"
```

Validate:

```bash
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm test"
```

### 3. Known symbol/file bug

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix campaignToDb conversion issue"
npm run ai:preflight -- "Fix campaignToDb conversion issue"
npm run ai:graph:query -- "campaignToDb"
```

PowerShell:

```powershell
Select-String -Path "AI_SYMBOL_INDEX.json" -Pattern "campaignToDb" -SimpleMatch -Context 4,8
Select-String -Path "src/storage/remoteStore.ts" -Pattern "campaignToDb" -SimpleMatch -Context 40,60
```

### 4. Avoid repeating tests

```bash
npm run ai:test:status
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm run build"
```

The second run can be skipped when the same command already passed with the same repository fingerprint.

---

## Benchmark and validation snapshot

Real project validation on a Vite + React + TypeScript Meta Ads dashboard showed:

| Check | Result |
|---|---:|
| Installed `ai-code-intelligence-toolkit` | `1.0.9` |
| Installed `typedoc-hybrid-source-links` | `1.0.9` |
| TypeDoc version | `0.28.x` |
| TypeDoc entrypoint strategy | `expand` |
| Preserved glob entry points | yes |
| Graph source files indexed | 74 |
| Graph nodes | 2541 |
| Graph edges | 138 |
| TypeDoc source URLs | 1527 |
| GitHub blob links in local mode | 0 |
| Graph leak count | 0 |
| Conflict markers after injection | 0 |

The benchmark is a practical validation snapshot, not a universal performance guarantee. Different repositories will produce different graph sizes and warning counts.

---

## Expected TypeDoc warnings

TypeDoc may warn about internal or referenced types not included in the documentation. These are documentation completeness warnings, not necessarily toolkit failures.

Examples:

```txt
SomeType is referenced by SomeFunction but not included in the documentation
The glob api/**/*.tsx did not match any files
```

Treat as blockers only when TypeDoc fails to create `typedoc-api.json` or when `typedoc:check-local` fails.

---

## Health commands

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

One-shot final health:

```bash
npm run ai:final-health
```

---

## Files agents should treat carefully

Avoid hand-editing unless the task is specifically about tooling/docs generation:

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

Generated files should be regenerated through scripts.

---

## License

MIT
