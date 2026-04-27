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
