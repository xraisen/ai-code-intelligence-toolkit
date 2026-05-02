# AI Code Intelligence Toolkit

**A practical anti-drift operating system for AI coding agents.**

AI Code Intelligence Toolkit is designed for real repositories where AI agents tend to lose context, reread too much code, rerun the same validation commands, forget prior fixes, or drift back into previously broken states. The toolkit installs an operating workflow around four ideas:

1. **Fresh context first** — rebuild TypeDoc JSON and the code graph before editing.
2. **Bounded navigation** — use `AI_GROUND_TRUTH.md`, `AI_SYMBOL_INDEX.json`, graph query, and targeted `Select-String` reads instead of broad file dumps.
3. **Durable memory** — keep a numbered changelog in `docs/ai-changelog/` so future agents can see what changed and why.
4. **Validation memory** — avoid rerunning the same passed checks when the repo fingerprint has not changed.

![Precision workflow diagram](docs/assets/precision-workflow-diagram.png)

---

## Why teams install this

Large codebases punish vague navigation and repeated guesswork. Without a clear contract, AI agents commonly:

- open broad files and waste context budget,
- guess symbol locations instead of locating them,
- rerun build/test commands unnecessarily,
- forget that a bug was already fixed,
- reintroduce old broken states,
- refuse valid edits because they misread preflight output as a whitelist,
- or patch code before understanding the task and the exact file path.

This toolkit fixes that with a repeatable operating loop.

---

## What changes after installation

![Benchmark and before/after benefits](docs/assets/codex-windows-tested-benchmark.png)

| Without the toolkit | With the toolkit |
|---|---|
| Agent starts from broad repo search. | Agent starts from `docs/ai-changelog/START_HERE.md`, `AI_GROUND_TRUTH.md`, `AI_SYMBOL_INDEX.json`, and graph query. |
| Agent burns tokens reading whole files. | Agent uses bounded `Select-String` windows around exact symbols or phrases. |
| Agent may forget a fix done earlier. | Numbered changelog entries and `history.index.json` preserve prior work. |
| Agent reruns the same successful build or test. | `ai:test:smart` and `ai:test:status` add validation memory. |
| Agent can drift after many edits or commits. | The anti-drift loop is mandatory before each new edit cycle. |
| Agent may think preflight output blocks edits. | Contract explicitly allows all necessary edits after discovery finishes. |

---

## Evidence-backed validation snapshot

The latest live validation in a real project (`mtll-meta-control-vercel`) after the v1.0.9 fix showed the workflow working end to end:

| Metric | Observed result |
|---|---:|
| TypeDoc local source URLs | `1,527` |
| GitHub blob links in local mode | `0` |
| Graph nodes | `2,541` |
| Graph edges | `138` |
| Graph leak count | `0` |
| TypeDoc entrypoint strategy | `expand` |
| TypeDoc fallback used | `false` |
| Preserved entrypoint globs | `src/**/*.ts`, `src/**/*.tsx`, `api/**/*.ts`, `api/**/*.tsx`, `scripts/**/*.mjs` |

This matters because the earlier failure mode was a broken entrypoint rewrite that converted explicit globs into bare folders and caused `Unable to find any entry points.` The current behavior preserves the intended configuration and produces usable local documentation JSON for AI context.

---

## Companion package

For the full tested workflow, install this together with **TypeDoc Hybrid Source Links**.

```powershell
npm install -D typedoc typedoc-hybrid-source-links@latest ai-code-intelligence-toolkit@latest
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite --strict
npm run ai:history:init
npm run ai:inject-contract
```

### Package roles

- **`typedoc-hybrid-source-links`** supplies local-vs-GitHub TypeDoc source link handling, TypeDoc health checks, and TypeDoc config generation.
- **`ai-code-intelligence-toolkit`** supplies the anti-drift contract, code graph tools, durable changelog memory, smart validation memory, and the agent workflow.

---

## What gets installed

```text
AGENTS.md
README.md
AI_GROUND_TRUTH.md
AI_SYMBOL_INDEX.json
scripts/ai/spec-preflight.mjs
scripts/ai/codex-preflight.mjs
scripts/ai/history-worklog.mjs
scripts/ai/test-smart-runner.mjs
scripts/ai/inject-agent-contract.mjs
scripts/graphrag/build-code-graph.mjs
scripts/graphrag/query-code-graph.mjs
scripts/graphrag/doctor.mjs
scripts/graphrag/check-no-leaks.mjs
docs/ai-changelog/START_HERE.md
docs/ai-changelog/history.index.json
mcp/codebase-intelligence-server.mjs
```

It also injects managed contract sections into `AGENTS.md` and `README.md` while preserving project-specific content outside the managed block.

---

## Core workflow

Use this **before every AI coding task**:

```powershell
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

After that, the agent may edit every necessary repository file required to complete the task correctly.

### Why this order matters

- `ai:history:status` checks prior numbered fixes.
- `typedoc:json:local && ai:graph:build` refreshes machine-readable context.
- `ai:spec` clarifies the task and anti-drift contract.
- `ai:preflight` clarifies validation and navigation expectations.
- `ai:graph:query` identifies concrete files, symbols, or routes before opening source code.

---

## Command reference

### Main commands

| Purpose | Command |
|---|---|
| Refresh context | `npm run ai:context:refresh` |
| Task spec | `npm run ai:task:spec -- "<task>"` |
| Task preflight | `npm run ai:task:preflight -- "<task>"` |
| Find context | `npm run ai:context:find -- "<symbol/file/error>"` |
| Graph doctor | `npm run ai:context:doctor` |
| Leak check | `npm run ai:context:leak-check` |
| Contract inject | `npm run ai:contract:inject` |
| Contract repair | `npm run ai:contract:repair` |
| History status | `npm run ai:history:status` |
| Add numbered fix entry | `npm run ai:history:add -- --task "<task>" --summary "<summary>"` |
| Smart validation | `npm run ai:test:smart -- "npm run build"` |
| Validation status | `npm run ai:test:status` |
| Final health | `npm run ai:final-health` |

### Compatibility aliases

```powershell
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<symbol/file/error>"
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

---

## PowerShell contract for low-token navigation

When working in PowerShell, do **not** start with broad `Get-Content` dumps or broad `rg` searches.

Use:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json","docs/ai-changelog/START_HERE.md" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

This keeps context bounded and cuts token waste.

### Recommended read order

1. `AGENTS.md`
2. `docs/ai-changelog/START_HERE.md`
3. `AI_GROUND_TRUTH.md`
4. `AI_SYMBOL_INDEX.json`
5. `.ai/code-graph/graph.json`
6. Targeted source windows only

---

## Durable changelog memory

The toolkit creates:

```text
docs/ai-changelog/START_HERE.md
docs/ai-changelog/history.index.json
```

Use them to keep a durable numbered work history.

### Add an entry

```powershell
npm run ai:history:add -- --task "Fix dashboard overflow" --summary "Adjusted layout sizing, overflow behavior, and panel constraints." --files "src/App.tsx,src/professional-polish.css" --validation "npm run build"
```

Example output file:

```text
docs/ai-changelog/001-fix-dashboard-overflow.md
```

This is especially useful on large repositories where many agents or many months of work make it easy to lose track.

---

## Smart validation memory

Instead of rerunning the same build, lint, or test commands repeatedly, run them through the smart validation runner.

```powershell
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm run lint"
npm run ai:test:smart -- "npm run test"
npm run ai:test:status
```

If the same command already passed against the same unchanged repository fingerprint, the tool can skip the redundant rerun.

---

## Use-case examples

### Example 1 — UI/layout fix

```powershell
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix dashboard spacing, list overflow, side panel layout, and text clipping"
npm run ai:preflight -- "Fix dashboard spacing, list overflow, side panel layout, and text clipping"
npm run ai:graph:query -- "dashboard layout side panel list view App"
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json" -Pattern "dashboard layout" -SimpleMatch -Context 4,8
npm run ai:test:smart -- "npm run build"
npm run ai:history:add -- --task "Fix dashboard layout" --summary "Adjusted spacing, panel sizing, and overflow behavior." --validation "npm run build"
```

### Example 2 — Backend/API behavior fix

```powershell
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix readiness endpoint, webhook validation, and permission checks"
npm run ai:preflight -- "Fix readiness endpoint, webhook validation, and permission checks"
npm run ai:graph:query -- "readiness webhook permissions api"
npm run ai:test:smart -- "npm run test"
npm run ai:history:add -- --task "Fix backend readiness" --summary "Updated readiness and webhook validation behavior." --validation "npm run test"
```

### Example 3 — Known symbol or file fix

```powershell
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "Fix broken TypeDoc source-link behavior"
npm run ai:preflight -- "Fix broken TypeDoc source-link behavior"
npm run ai:graph:query -- "typedoc-source-config sourceLinkTemplate"
Select-String -Path "scripts/typedoc-source-config.mjs" -Pattern "sourceLinkTemplate" -SimpleMatch -Context 40,60
```

---

## Expected warnings vs blockers

### Usually acceptable warnings

- Some documentation warnings about referenced internal types not included in generated docs.
- A glob such as `api/**/*.tsx` not matching files when the project does not contain those file types.

### Real blockers

- `Unable to find any entry points.`
- Missing `typedoc-api.json` after `npm run typedoc:json:local`.
- GitHub blob links appearing in local TypeDoc mode.
- Graph doctor missing required files or scripts.
- Graph leak check reporting leaks.
- Merge conflict markers in `AGENTS.md` or `README.md`.

---

## Final health gate

Run before committing tooling or agent-workflow changes:

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

Or use the bundled final command:

```powershell
npm run ai:final-health
```

---

## Benchmarked outcome in plain English

The practical improvement is simple:

- fresher code context,
- fewer wasted tokens,
- less repeated validation,
- stronger memory of past fixes,
- fewer navigation mistakes,
- and less chance that an AI agent drifts back into a previously broken state.

---

## License

MIT
