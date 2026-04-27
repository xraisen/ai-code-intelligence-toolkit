# AI Code Intelligence Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![AI Coding Agents](https://img.shields.io/badge/AI%20Coding%20Agents-Codex%20%7C%20Claude%20Code%20%7C%20Cursor%20%7C%20Cline-blueviolet)](#who-this-is-for)
[![GraphRAG](https://img.shields.io/badge/GraphRAG-code%20intelligence-teal)](#local-graphrag-code-graph)

**AI Code Intelligence Toolkit** is a reusable local **GraphRAG code intelligence**, **AI coding agent guardrail**, and **preflight scoping** toolkit for JavaScript and TypeScript repositories.

It helps AI coding agents such as **Codex**, **Claude Code**, **Cursor**, **Trae**, **Kimi**, **Cline**, **RooCode**, and custom MCP agents navigate real repositories with less drift, less blind scanning, and tighter patch scope.

> **Ground Truth first. Graph second. Patch smallest. Validate focused.**

---

## SEO keywords / problems this solves

This project is built for developers searching for:

- AI coding agent guardrails
- Codex `AGENTS.md` workflow
- Claude Code repo instructions
- Cursor rules alternative
- Cline / RooCode repository context
- AI code drift prevention
- GraphRAG for code repositories
- local code graph for AI agents
- MCP code intelligence server
- AI preflight before coding
- reduce AI coding agent mistakes
- token-efficient repo navigation
- TypeDoc AI context generation
- TypeScript code intelligence toolkit

---

## Who this is for

Use this if you:

- use AI coding agents on large repos,
- lose time because agents edit the wrong files,
- want a local code graph instead of blind `rg` scans,
- need an `AGENTS.md`-compatible operating contract,
- want AI agents to return allowed read files and allowed patch files before editing,
- need generated-file leak checks for `dist/`, `build/`, `docs/api/`, mobile public assets, or TypeDoc outputs,
- want benchmarkable repo workflow health checks before giving an agent a task.

---

## Companion prerequisite: TypeDoc Hybrid Source Links

For the **complete validated workflow**, install this toolkit together with:

```txt
typedoc-hybrid-source-links
```

This repository focuses on:

```txt
GraphRAG/code graph
ai:spec planning
smart ai:preflight routing
graph doctor
generated-file leak checks
MCP-ready code intelligence
AGENTS.md and README workflow instructions
```

The companion repository focuses on:

```txt
TypeDoc local VS Code source links
GitHub blob source links
typedoc:health
typedoc:doctor
typedoc:check-local
AI-context-safe TypeDoc JSON
```

| Setup | Supported? | Notes |
|---|---:|---|
| `ai-code-intelligence-toolkit` only | Yes | GraphRAG, preflight, spec, doctor, and leak checks work. TypeDoc commands need compatible TypeDoc tooling. |
| `typedoc-hybrid-source-links` only | Yes | Hybrid TypeDoc local/GitHub source links work independently. |
| Both together | **Recommended** | This is the full benchmarked workflow shown below. |

Install both:

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite
```

---

## Benchmark images

The images below are intentionally embedded with **relative paths**, not `https://github.com/.../blob/main/...` URLs.

Why? Because hardcoded GitHub blob URLs break when:

- the file is not committed yet,
- the default branch is not `main`,
- the repo is forked,
- the asset filename differs,
- GitHub cache has not refreshed.

Put the PNGs here:

```txt
docs/assets/repo-performance-benchmark-before-vs-after.png
docs/assets/repo-comparison-and-ecosystem-analysis.png
```

Then this README will render correctly on GitHub.

### Before vs After: Repo A + Repo B workflow benchmark

![Before vs After: Repo A + Repo B Benchmark](docs/assets/repo-performance-benchmark-before-vs-after.png)

### Public comparison with popular coding-agent ecosystems

![Repo A + Repo B vs Popular Coding-Agent Ecosystems](docs/assets/repo-comparison-and-ecosystem-analysis.png)

> These images summarize local validation logs and public model/tool sources. They are workflow benchmarks, not universal model-IQ benchmarks.

---

## What it installs

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

Optional bundled TypeDoc support may install:

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

## Install

### From npm after publishing

```bash
npm install --save-dev ai-code-intelligence-toolkit
npx ai-code-intel-install --target . --overwrite
```

### From source

```bash
git clone https://github.com/xraisen/ai-code-intelligence-toolkit.git
cd ai-code-intelligence-toolkit
node bin/install.mjs --target /path/to/your/repo --overwrite
```

---

## Main commands

```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
npm run mcp:code-intel
```

If TypeDoc support is installed:

```bash
npm run typedoc:health
npm run typedoc:doctor
npm run typedoc:json:local
npm run typedoc:check-local
```

---

## Local GraphRAG code graph

Build the graph:

```bash
npm run ai:graph:build
```

Query it:

```bash
npm run ai:graph:query -- "auth session user context"
npm run ai:graph:query -- "payment webhook event id"
npm run ai:graph:query -- "typedoc sourceLinkTemplate local github"
```

Check health:

```bash
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

The graph is designed to answer questions like:

```txt
feature -> files
symbol -> file
file -> imports
file -> exports
file -> probable callers
file -> docs
file -> validation hints
task -> read commands
```

---

## Smart preflight

Use preflight before giving an AI agent permission to edit files:

```bash
npm run ai:preflight -- "Patch only GraphRAG builder and doctor exclude rules."
```

Example output shape:

```json
{
  "ok": true,
  "route": {
    "id": "graphrag_tooling",
    "label": "GraphRAG / code graph tooling"
  },
  "spec": {
    "allowedPatchFiles": [
      "scripts/graphrag/build-code-graph.mjs",
      "scripts/graphrag/doctor.mjs",
      "scripts/graphrag/check-no-leaks.mjs",
      "scripts/ai/graphrag-script-contract.mjs",
      "package.json",
      "package.scripts.add.json"
    ],
    "forbiddenPatchHints": [
      "src/**",
      "supabase/functions/**",
      "android/**",
      "ios/** except explicit tooling path if listed"
    ]
  }
}
```

This is the core value: **the AI agent gets a patch boundary before editing**.

---

## Recommended AI-agent workflow

```bash
npm run ai:spec -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
npm run ai:preflight -- "task description"
```

Then the agent should:

1. read only targeted files,
2. patch only `allowedPatchFiles`,
3. run focused validation commands,
4. avoid broad repo search unless all routing fails.

---

## AGENTS.md snippet

Add this to your repository `AGENTS.md`:

```md
## AI Code Intelligence Workflow

Agents must avoid broad repository search as the first step.

Preferred order:

1. Read `AGENTS.md`.
2. Search source-of-truth docs and symbol indexes if present.
3. Run:

   ```bash
   npm run ai:graph:doctor
   ```

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

## Validation benchmark

The following numbers come from real local validation logs captured during development on a large TypeScript/React/Supabase repository. They are **workflow/tooling measurements**, not universal model benchmarks.

### Before

| Signal | Observed result |
|---|---|
| Graph build | Timeout-prone / too slow to finish reliably before bounded fast mode. |
| Graph doctor | `ok: false`. |
| Generated path leak check | `leakCount: 1`. |
| Preflight patch scope | `allowedPatchFiles: []` for known tooling prompts. |
| TypeDoc docs generation | 83 errors and 114 warnings when docs scan was too broad. |
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

---

## Token usage and cost caveat

This toolkit is designed to reduce unnecessary context loading by returning targeted read commands and patch boundaries.

However, the public validation logs did **not** capture token telemetry. Do not claim a measured token-reduction percentage unless you add token accounting in your own environment.

Honest claim:

```txt
The toolkit reduces blind scanning and narrows patch scope, which can reduce unnecessary AI context usage.
```

Unsupported claim:

```txt
The toolkit reduces tokens by X%.
```

---

## Comparison with AI coding tools

This toolkit does not replace Codex, Claude Code, Cursor, Trae, Kimi, Cline, or RooCode. It gives those tools a better repo-local workflow.

| Stack | What it is | Public signal | How this toolkit helps |
|---|---|---|---|
| OpenAI Codex / GPT models | Frontier coding agent/model ecosystem | OpenAI reports GPT-5 at 74.9% SWE-bench Verified and 88% Aider polyglot. OpenAI reports GPT-5.4 at 57.7% SWE-Bench Pro and up to 1M context. Codex tasks are described as typically taking 1–30 minutes depending on complexity. | Adds local graph, preflight, patch scope, AGENTS.md workflow, and leak checks. |
| Claude / Anthropic | Frontier coding model ecosystem | Anthropic reports Claude Sonnet 4.6 at 80.2% SWE-bench Verified with prompt modification and 1M context beta. | Adds source-of-truth routing and graph health checks before Claude-based edits. |
| Cursor | AI IDE shell over multiple models | Cursor publishes Pro, Pro+, Ultra, Teams pricing. Model-neutral IDE benchmark depends on chosen model and workflow. | Adds repo-level commands and guardrails Cursor agents can follow. |
| Trae | AI IDE/agent shell | Official pricing page exists; public apples-to-apples coding benchmark is not standardized. | Adds local preflight and graph discipline. |
| Kimi | Model/API ecosystem | Kimi docs describe K2.5 with 256K context and turbo preview at 60–100 tokens/s. | Adds repo graph and patch scoping when using Kimi in coding tools. |

---

## Suggested GitHub About metadata

Use this description:

```txt
Local GraphRAG, smart preflight, AGENTS.md guardrails, MCP-ready code intelligence, and leak checks for AI coding agents.
```

Suggested GitHub topics:

```txt
ai-coding-agent
codex
claude-code
cursor
cline
roocode
graphrag
code-intelligence
mcp
agents-md
typescript
developer-tools
ai-code-review
repo-analysis
typedoc
```

---

## Sources

- [OpenAI — Introducing GPT-5 for developers](https://openai.com/index/introducing-gpt-5-for-developers/)
- [OpenAI — Introducing GPT-5.4](https://openai.com/sq-AL/index/introducing-gpt-5-4/)
- [OpenAI — Introducing Codex](https://openai.com/index/introducing-codex/)
- [OpenAI — Why SWE-bench Verified no longer measures frontier coding capabilities](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)
- [OpenAI Help Center — Codex pricing / token credits](https://help.openai.com/)
- [Anthropic — Introducing Claude Sonnet 4.6](https://www.anthropic.com/research/claude-sonnet-4-6)
- [Anthropic — Claude SWE-bench Performance](https://www.anthropic.com/engineering/swe-bench-sonnet/)
- [Cursor Pricing](https://cursor.com/pricing)
- [Trae Pricing](https://www.trae.ai/pricing)
- [Kimi API Platform — Kimi K2.5 in programming tools](https://platform.moonshot.ai/docs/guide/agent-support.en-US)
- [TypeDoc Input Options](https://typedoc.org/documents/Options.Input.html)
- [TypeDoc Output Options](https://typedoc.org/documents/Options.Output.html)

---

## License

MIT. See [LICENSE](LICENSE).
