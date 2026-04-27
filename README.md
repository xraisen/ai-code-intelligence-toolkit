# AI Code Intelligence Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![Tested Workflow](https://img.shields.io/badge/tested-Codex%20CLI%20%2B%20Windows%20app-111827)](#tested-environment)

**AI Code Intelligence Toolkit** gives AI-assisted coding a safer operating layer inside real repositories. It adds a local GraphRAG-style code graph, task preflight, patch boundaries, generated-file leak checks, and repo instructions that fit a Codex-compatible `AGENTS.md` workflow.

It is for developers who use AI assistants to code and want fewer wrong-file edits, less drift, clearer validation, and faster repo understanding.

It is **not** a token-saving product. Any token or cost reduction is only a side effect of better precision: fewer irrelevant files read, narrower patch scope, and healthier source navigation.

![Benchmark: unstructured AI coding vs guarded Codex-compatible workflow](docs/assets/codex-windows-tested-benchmark.png)

![Precision workflow diagram](docs/assets/precision-workflow-diagram.png)

---

## What this toolkit does

```txt
ai:spec              Creates a task spec before coding
ai:preflight         Returns allowed read files, allowed patch files, and validation commands
ai:graph:build       Builds a fast local code graph
ai:graph:query       Finds related files, symbols, docs, and read commands
ai:graph:doctor      Checks whether the graph and scripts are healthy
ai:graph:check-leaks Blocks generated/build/archive files from becoming source truth
mcp:code-intel       Starts an MCP-ready code intelligence server
```

---

## Tested environment

This release is tested only on:

```txt
Codex CLI
Codex Windows app workflow
Windows repository worktree
Node.js >= 20
```

Other coding assistants may be able to run the same npm scripts because they are plain Node.js commands, but this project does not claim those workflows are tested.

---

## Why this matters for AI-assisted coding

Vibe coding fails when the assistant guesses the repo shape. The common failure pattern is simple:

```txt
broad search → too much context → wrong file → unrelated patch → failing validation → more guessing
```

This toolkit changes the loop:

```txt
spec → graph health → precise query → preflight patch boundary → focused read → focused patch → focused validation
```

That precision is the product. Lower token exposure, lower cost exposure, and lower review time are possible side effects because the assistant has less irrelevant repo surface to load.

---

## Install

```bash
npm install --save-dev ai-code-intelligence-toolkit
npx ai-code-intel-install --target . --overwrite
```

For the complete validated workflow, install it with **TypeDoc Hybrid Source Links**:

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite
```

---

## Quick start

```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
```

---

## Benchmark: unstructured AI coding vs guarded Codex-compatible workflow

This benchmark compares two workflows:

| Workflow | Meaning |
|---|---|
| **Without these tools** | A developer or vibe coder asks an AI assistant to inspect, search, or fix a repository without a graph, task preflight, generated-file leak check, or TypeDoc source-link health check. The practical risk surface is the repo surface the assistant may inspect or patch. |
| **With AI Code Intelligence Toolkit + TypeDoc Hybrid Source Links** | A developer runs a Codex-compatible workflow with `AGENTS.md`, `ai:spec`, `ai:preflight`, a local graph, graph doctor, leak checker, and TypeDoc health checks before patching. |

This is a **workflow benchmark**, not a model benchmark. It does not claim to make Codex, Claude, Cursor, Cline, RooCode, Kimi, or any assistant smarter. It measures scope control, graph health, leak detection, and documentation-link health around an assistant.

### Tested environment

The workflow has been tested only with:

```txt
Codex CLI
Codex Windows app workflow
Windows repository worktree
Node.js >= 20
```

Other AI assistants may use the same npm scripts because they are plain Node.js commands, but this README does **not** claim they are tested.

### Real local validation result

| Metric | Without these tools | With these tools | Result |
|---|---:|---:|---:|
| Patch boundary | No deterministic patch boundary | 6 GraphRAG files / 11 TypeDoc files | Fixed |
| Repo surface exposed to the task | Up to 723 indexed files | 6–11 allowed patch files | 98.48%–99.17% narrower patch surface |
| Graph build | Unreliable / timeout-prone baseline | 1.378s, `timedOut: false` | Fast and repeatable |
| Graph doctor | Previously unhealthy | `ok: true` | Pass |
| Generated-file leaks | 1 leak | 0 leaks | 100% leak reduction |
| TypeDoc health | Unconfirmed | `ok: true` | Pass |
| TypeDoc doctor | Unconfirmed | `ok: true` | Pass |
| Workflow smoke gates | No structured health gate | 8/8 passed | 100% workflow pass for tested gates |
| Files processed by graph | — | 723 | Measured |
| Source files indexed | — | 466 | Measured |
| Graph nodes | — | 5,320 | Measured |
| Graph edges | — | 15,745 | Measured |

### File-surface exposure model

The validation run did not record raw token telemetry. Instead, this project reports **file-surface exposure**, which is the safest way to explain why token and cost waste may drop as a side effect.

```txt
GraphRAG task:
  Without the tools: 723-file repo surface
  With the tools: 6 allowed patch files
  Surface reduction: 1 - (6 / 723) = 99.17%
  Unstructured workflow exposes 120.50x more file surface

TypeDoc task:
  Without the tools: 723-file repo surface
  With the tools: 11 allowed patch files
  Surface reduction: 1 - (11 / 723) = 98.48%
  Unstructured workflow exposes 65.73x more file surface

Average of the two tested scopes:
  Average allowed patch files: 8.5
  Average surface reduction: 1 - (8.5 / 723) = 98.82%
  Unstructured workflow exposes 85.06x more file surface
```

### Token and cost honesty

This is **not** sold as a token-saving or money-saving tool.

The primary purpose is precision:

```txt
better file targeting
smaller patch boundaries
less wrong-file drift
health checks before patching
local graph-based repo understanding
TypeDoc links that point to the right source location
```

Lower token or cost exposure can happen as a side effect when an assistant reads fewer irrelevant files. But exact token or billing savings require real telemetry from the assistant session: input tokens, cached input tokens, output tokens, files read, and files patched.

### Drift and workflow accuracy

Measured workflow accuracy in the validation run:

| Gate | Result |
|---|---:|
| `typedoc:health` | Pass |
| `typedoc:doctor` | Pass |
| GraphRAG smart preflight route | Pass |
| TypeDoc smart preflight route | Pass |
| `ai:graph:build` | Pass |
| `ai:graph:doctor` | Pass |
| `ai:graph:check-leaks` | Pass |
| `ai:spec` smoke test | Pass |

```txt
8 / 8 workflow gates passed = 100% workflow pass rate for the tested gates.
Generated-file graph leaks: 1 → 0 = 100% leak reduction.
Patch drift surface: 98.48%–99.17% narrower than the 723-file indexed surface.
```

For true code-correctness accuracy, use a separate labeled benchmark with real tasks, expected files, expected tests, human review, and pass/fail outcomes.


---

## Recommended AGENTS.md instruction

Add this to your repo’s `AGENTS.md`:

```md
## AI Code Intelligence Workflow

Before patching source code:

1. Run `npm run ai:spec -- "task description"`.
2. Run `npm run ai:graph:doctor`.
3. Query a specific target with `npm run ai:graph:query -- "symbol, feature, route, file, or error"`.
4. Run `npm run ai:preflight -- "task description"`.
5. Read only targeted files.
6. Patch only files listed in `allowedPatchFiles`.
7. Run the validation commands returned by preflight.

Do not begin with broad repository search unless the graph and source-truth routes fail.
```

---

## Recommended README section for installed projects

```md
## AI Code Intelligence

This repository uses AI Code Intelligence Toolkit for local graph-based repository navigation, preflight patch scoping, generated-file leak checks, and Codex-compatible `AGENTS.md` workflow support.

Common commands:

npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"

Tested workflow: Codex CLI and Codex Windows app workflow.
```

---

## Evidence and sources

This project separates local benchmark evidence from public product documentation.

Local validation evidence:

```txt
typedoc:health → ok: true
typedoc:doctor → ok: true
GraphRAG preflight → graphrag_tooling route + 6 allowed patch files
TypeDoc preflight → typedoc_tooling route + 11 allowed patch files
ai:graph:build → 1.378s, 723 files processed, 466 source files indexed, 5,320 nodes, 15,745 edges
ai:graph:doctor → ok: true
ai:graph:check-leaks → ok: true, leakCount: 0
ai:spec smoke test → ok: true
```

Public documentation:

- OpenAI documents that Codex can be guided by `AGENTS.md` files placed in a repository and that these files can tell Codex how to navigate the codebase, which commands to run, and how to follow project practices.
- OpenAI describes Codex CLI as a cross-platform local software agent.
- OpenAI describes Codex app availability for macOS and Windows.
- OpenAI documents token-based Codex pricing for applicable plans, calculated from input, cached input, and output tokens.
- TypeDoc documents `sourceLinkTemplate` and the `{path}`, `{line}`, and `{gitRevision}` placeholders.

Reference links:

- https://openai.com/index/introducing-codex/
- https://openai.com/index/unrolling-the-codex-agent-loop/
- https://openai.com/index/codex-flexible-pricing-for-teams/
- https://help.openai.com/articles/20001106-codex-rate-card
- https://typedoc.org/documents/Options.Input.html


---

## Copyright and trademark safety

See [TRADEMARKS.md](TRADEMARKS.md). This project is independently maintained and is not owned by or affiliated with OpenAI, Codex, TypeDoc, Microsoft, GitHub, Anthropic, Cursor, Trae, Kimi, Cline, RooCode, or any related vendor.

No vendor logos are shipped.

---

## License

MIT.
