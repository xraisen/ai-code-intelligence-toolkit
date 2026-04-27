# AI Code Intelligence Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/status-v1.0.0--ready-brightgreen.svg)](#validation-and-benchmark-evidence)

**AI Code Intelligence Toolkit** is a reusable local code-intelligence layer for AI coding agents. It adds a fast local GraphRAG-style code graph, graph health checks, generated-file leak detection, smart task preflight routing, implementation spec scaffolding, MCP-ready code intelligence, and optional TypeDoc hybrid source-link support.

It is designed for developers using AI coding tools such as Codex, Claude Code, Cursor, Trae, Kimi-based tools, Cline/RooCode, or custom agents who want less drift, less blind repo scanning, and better scoped patches.

> **Tagline:** Ground Truth first. Graph second. Patch smallest. Validate focused.

---

## Why this exists

Modern coding agents are powerful, but most mistakes in real repositories are not caused by weak syntax generation. They often come from workflow problems:

- reading too much of the repo without a target,
- editing files outside the task scope,
- confusing generated files with source files,
- inventing symbols, functions, routes, hooks, or contracts,
- using stale docs or generated API output as truth,
- running broad validations before focused checks,
- wasting tokens and developer time on blind search.

This toolkit gives AI agents a repo-local operating contract:

1. **Plan the task.**
2. **Resolve source-of-truth files.**
3. **Query a local relationship graph.**
4. **Return allowed read files and allowed patch files.**
5. **Reject generated-file leaks.**
6. **Validate with focused commands first.**

---

## What this toolkit includes

| Area | Tool | Purpose |
|---|---|---|
| GraphRAG/code graph | `ai:graph:build` | Builds `.ai/code-graph/*` from repository files in fast bounded mode. |
| Graph query | `ai:graph:query` | Finds related files, symbols, docs, imports, and read commands. |
| Graph doctor | `ai:graph:doctor` | Checks graph health, required files, required scripts, and leak status. |
| Leak checker | `ai:graph:check-leaks` | Ensures generated/build/archive paths are not indexed as source truth. |
| Task spec | `ai:spec` | Produces a structured implementation spec for AI-agent work. |
| Smart preflight | `ai:preflight` | Returns allowed read files, allowed patch files, forbidden hints, and validation commands. |
| MCP bridge | `mcp:code-intel` | Starts an MCP-ready code intelligence server for compatible clients. |
| TypeDoc support | `typedoc:health` | Optional bundled health check for hybrid local/GitHub TypeDoc source links. |

---

## Installation

### Install from npm after publishing

```bash
npm install --save-dev ai-code-intelligence-toolkit
npx ai-code-intel-install --target . --overwrite
```

### Install from a local clone

```bash
git clone https://github.com/xraisen/ai-code-intelligence-toolkit.git
cd ai-code-intelligence-toolkit

node bin/install.mjs --target /path/to/your/repo --overwrite
```

### What the installer does

The installer copies the toolkit scripts into your target repo and injects package scripts. It can also add AI-agent instructions into your repo docs.

Installed files commonly include:

```txt
scripts/graphrag/build-code-graph.mjs
scripts/graphrag/query-code-graph.mjs
scripts/graphrag/doctor.mjs
scripts/graphrag/check-no-leaks.mjs
scripts/ai/codex-preflight.mjs
scripts/ai/spec-preflight.mjs
scripts/ai/graphrag-script-contract.mjs
mcp/codebase-intelligence-server.mjs
```

If TypeDoc helper support is enabled, it may also install:

```txt
scripts/typedoc-source-config.mjs
scripts/typedoc-source-link-doctor.mjs
scripts/typedoc-tool-health.mjs
scripts/ai/typedoc-local-source-check.mjs
typedoc.json
typedoc-frontend.json
typedoc-ci.json
typedoc-strict.json
tsconfig.doc.json
```

---

## Package scripts added to the target repo

```json
{
  "ai:graph:build": "node scripts/graphrag/build-code-graph.mjs --fast",
  "ai:graph:build:fast": "node scripts/graphrag/build-code-graph.mjs --fast",
  "ai:graph:build:minimal": "node scripts/graphrag/build-code-graph.mjs --minimal",
  "ai:graph:build:full": "node scripts/graphrag/build-code-graph.mjs --full --include-tests",
  "ai:graph:query": "node scripts/graphrag/query-code-graph.mjs",
  "ai:graph:doctor": "node scripts/graphrag/doctor.mjs",
  "ai:graph:check-leaks": "node scripts/graphrag/check-no-leaks.mjs",
  "ai:graph:health": "npm run ai:graph:build && npm run ai:graph:doctor && npm run ai:graph:check-leaks",
  "ai:spec": "node scripts/ai/spec-preflight.mjs",
  "ai:preflight": "node scripts/ai/codex-preflight.mjs",
  "mcp:code-intel": "node mcp/codebase-intelligence-server.mjs"
}
```

If bundled TypeDoc support is installed, additional scripts may be added:

```json
{
  "typedoc:health": "node scripts/typedoc-tool-health.mjs",
  "typedoc:doctor": "node scripts/typedoc-tool-health.mjs",
  "typedoc:json:local": "npm run typedoc:config:local && node --max-old-space-size=8192 ./node_modules/typedoc/bin/typedoc --json typedoc-api.json --options typedoc.local.generated.json",
  "typedoc:check-local": "node scripts/ai/typedoc-local-source-check.mjs"
}
```

---

## Quick start

Run these from your target repository root:

```bash
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

Then query a specific symbol, feature, route, table, error, or file:

```bash
npm run ai:graph:query -- "auth session user context"
npm run ai:graph:query -- "payment webhook event id"
npm run ai:graph:query -- "typedoc sourceLinkTemplate local github"
```

For AI-agent task planning:

```bash
npm run ai:spec -- "Fix the payment webhook eventId null handling without changing other payment flows."
npm run ai:preflight -- "Patch only payment webhook eventId null handling."
```

---

## Recommended AI-agent workflow

Use this flow before non-trivial edits:

```bash
npm run ai:spec -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
npm run ai:preflight -- "task description"
```

Then patch only files listed by `allowedPatchFiles`.

The intended AI-agent contract:

```txt
1. Do not begin with broad repository search.
2. Do not guess file paths or symbol names.
3. Prefer source-of-truth docs and symbol indexes when available.
4. Query the graph only when it is healthy.
5. Patch only the smallest valid scope.
6. Validate with focused commands before broad gates.
```

---

## Smart preflight examples

### GraphRAG tooling task

```bash
npm run ai:preflight -- "Patch only GraphRAG builder and doctor exclude rules."
```

Expected route:

```json
{
  "route": {
    "id": "graphrag_tooling",
    "label": "GraphRAG / code graph tooling"
  }
}
```

Expected allowed patch files:

```txt
scripts/graphrag/build-code-graph.mjs
scripts/graphrag/doctor.mjs
scripts/graphrag/check-no-leaks.mjs
scripts/ai/graphrag-script-contract.mjs
package.json
package.scripts.add.json
```

### TypeDoc tooling task

```bash
npm run ai:preflight -- "Patch only TypeDoc hybrid source-link generation. Do not touch app runtime code."
```

Expected route:

```json
{
  "route": {
    "id": "typedoc_tooling",
    "label": "TypeDoc hybrid local/GitHub source-link tooling"
  }
}
```

Expected allowed patch files include:

```txt
typedoc.json
typedoc-frontend.json
typedoc-ci.json
typedoc-strict.json
tsconfig.doc.json
scripts/typedoc-source-config.mjs
scripts/typedoc-source-link-doctor.mjs
scripts/typedoc-tool-health.mjs
scripts/ai/typedoc-local-source-check.mjs
package.json
package.scripts.add.json
```

---

## Validation and benchmark evidence

The following numbers come from real local validation logs captured during development on a large TypeScript/React/Supabase repository. They are workflow/tooling measurements, not universal model benchmarks.

### Before

| Signal | Observed result |
|---|---|
| Graph build | Timeout-prone / too slow to finish reliably before bounded fast mode. |
| Graph doctor | `ok: false`. |
| Generated path leak check | `leakCount: 1` due to generated/copied paths. |
| Preflight patch scope | `allowedPatchFiles: []` for known tooling prompts. |
| TypeDoc docs generation | 83 errors and 114 warnings when docs scan was too broad and strict checking was enabled. |
| TypeDoc tool status | Unconfirmed before `typedoc:health`. |

### After

| Signal | Observed result |
|---|---:|
| Fast graph build time | ~1.3–1.5 seconds |
| Files discovered/processed | 717–723 files |
| Source files indexed | ~466 |
| Nodes | 5,299–5,320 |
| Edges | 15,689–15,745 |
| Graph doctor | `ok: true` |
| Graph leaks | `leakCount: 0` |
| GraphRAG preflight patch scope | 6 allowed patch files |
| TypeDoc preflight patch scope | 11 allowed patch files |
| TypeDoc health | `ok: true` |
| TypeDoc doctor | `ok: true` |

### What these numbers mean

The toolkit does **not** claim to make the underlying model smarter. Instead, it improves the workflow around coding agents:

- faster repo relationship lookup,
- narrower patch scope,
- lower generated-file drift risk,
- clearer allowed/forbidden file boundaries,
- healthier docs/graph tooling,
- less blind searching.

### Token usage caveat

Token usage telemetry was **not** captured in the public validation logs. The toolkit’s token-saving claim is therefore a workflow inference: by returning targeted read commands and allowed patch files, it can reduce the need to paste or scan large repo sections. Do not market this as a measured token-reduction percentage unless you add actual token accounting in your own environment.

---

## Comparison with coding-agent ecosystems

This toolkit is not a replacement for Codex, Claude Code, Cursor, Trae, Kimi, or other coding agents. It is a repo-local workflow layer that makes those tools safer and more precise.

| Stack | What it is | Published/public signal | How this toolkit fits |
|---|---|---|---|
| OpenAI Codex / GPT models | Frontier coding agent/model ecosystem | GPT-5 reported 74.9% on SWE-bench Verified and 88% on Aider polyglot; GPT-5.4 reported 57.7% on SWE-bench Pro and up to 1M context; Codex tasks are described as typically taking 1–30 minutes depending on complexity. | Adds repo-local graph, preflight, and patch guardrails before/around Codex work. |
| Claude / Anthropic | Frontier coding model ecosystem | Claude Sonnet 4.6 reported 80.2% on SWE-bench Verified with prompt modification and 1M token context beta. | Adds local source-of-truth routing and graph checks for Claude-based agents. |
| Cursor | AI IDE shell over multiple models | Public pricing lists Pro, Pro+, Ultra, and Teams tiers. Standalone model-neutral coding benchmark is not consistently public because outcomes depend on selected model/workflow. | Adds installable repo guardrails and commands that Cursor agents can follow. |
| Trae | AI IDE/agent shell | Official pricing page exists; public apples-to-apples coding benchmark depends on model/workflow and is not standardized. | Adds local preflight/graph discipline for Trae-like agents. |
| Kimi | Model/API ecosystem with long context and agent use cases | Kimi docs describe K2.5 with 256K context and turbo preview at 60–100 tokens/s. | Adds local repo graph and scope control when using Kimi in programming tools. |

---

## Evidence-backed caveats

- SWE-bench style scores measure model/agent coding ability on benchmark tasks, not whether an IDE shell will patch your private repo safely.
- OpenAI has noted that SWE-bench Verified is increasingly contaminated and recommends SWE-bench Pro for frontier coding evaluation.
- TypeDoc officially supports `sourceLinkTemplate`, `{path}`, `{line}`, and `{gitRevision}` placeholders, which supports this toolkit’s local/GitHub documentation-link strategy.
- TypeDoc converts TypeScript comments/source exports into HTML documentation or a JSON model, which is why this toolkit can pair TypeDoc outputs with AI context generation.
- Cursor and Trae are tools/shells using multiple underlying models, so compare them carefully against model benchmarks.

---

## AGENTS.md snippet

Add this to your repository `AGENTS.md`:

```md
## AI Code Intelligence Workflow

Agents must avoid broad repository search as the first step.

Preferred order:

1. Read `AGENTS.md`.
2. Search source-of-truth docs and symbol indexes if present.
3. Run `npm run ai:graph:doctor`.
4. Query the graph with a specific target:

   ```bash
   npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
   ```

5. Run task preflight:

   ```bash
   npm run ai:preflight -- "task description"
   ```

6. Read only targeted files.
7. Patch only files listed in `allowedPatchFiles`.
8. Validate with the commands returned by preflight.

Forbidden unless explicitly justified:

```bash
rg "<term>" .
rg --files
grep -R "<term>" .
find . -type f
```

GraphRAG/code graph is a relationship helper. It does not replace source truth, tests, or human review.
```

---

## README injection section

Add this to your project README if useful:

```md
## AI Code Intelligence

This repo uses `ai-code-intelligence-toolkit` for AI-agent navigation, local GraphRAG/code graph lookup, patch preflight, and generated-file leak checking.

Common commands:

```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, feature, route, file, or error"
```

Agents should use these commands before non-trivial edits and patch only the files returned by `allowedPatchFiles`.
```

---

## Development

Run smoke validation inside this toolkit repo:

```bash
npm run smoke
```

Run syntax checks manually:

```bash
node --check scripts/graphrag/build-code-graph.mjs
node --check scripts/graphrag/query-code-graph.mjs
node --check scripts/graphrag/doctor.mjs
node --check scripts/graphrag/check-no-leaks.mjs
node --check scripts/ai/codex-preflight.mjs
node --check scripts/ai/spec-preflight.mjs
```

---

## Roadmap

Possible future enhancements:

- exact TypeScript AST call graph,
- exact import/export graph with ts-morph,
- token telemetry for before/after AI-agent sessions,
- model/tool adapter presets for Codex, Claude Code, Cursor, Trae, Kimi, Cline, and RooCode,
- CI report generator,
- HTML graph explorer,
- dependency-aware test recommendation.

---

## Sources and references

Public references used for the benchmark/comparison language:

- OpenAI, “Introducing GPT-5 for developers” — GPT-5 coding benchmark claims including SWE-bench Verified and Aider polyglot.
- OpenAI, “Introducing GPT-5.4” — SWE-bench Pro, context window, token efficiency, and Codex/API capability claims.
- OpenAI, “Introducing Codex” — Codex workflow, task runtime range, AGENTS.md behavior, and sandboxed task model.
- OpenAI Help Center, Codex pricing/credit table — token-based Codex credit model.
- OpenAI, “Why SWE-bench Verified no longer measures frontier coding capabilities” — benchmark caveat and SWE-bench Pro recommendation.
- Anthropic, “Introducing Claude Sonnet 4.6” — SWE-bench Verified score, pricing, and 1M context beta.
- Anthropic, “Claude SWE-bench Performance” — explanation that SWE-bench evaluates model + scaffold, not just raw model.
- Cursor pricing page — published Cursor Pro, Pro+, Ultra, Teams pricing.
- Trae pricing page — official Trae pricing surface.
- Kimi API Platform docs — Kimi K2.5 context and turbo speed claims.
- TypeDoc documentation — TypeDoc output, JSON model, and `sourceLinkTemplate` support.

---

## License

MIT. See [LICENSE](LICENSE).
