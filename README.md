# AI Code Intelligence Toolkit

> **Required companion for the complete tested workflow:** [TypeDoc Hybrid Source Links](https://github.com/xraisen/typedoc-hybrid-source-links)  
> **This repository:** [AI Code Intelligence Toolkit](https://github.com/xraisen/ai-code-intelligence-toolkit)

<<<<<<< HEAD
For the complete tested workflow, install both tools:
=======
**Required companion links:**

```txt
AI Code Intelligence Toolkit: https://github.com/xraisen/ai-code-intelligence-toolkit
TypeDoc Hybrid Source Links: https://github.com/xraisen/typedoc-hybrid-source-links
```

Install the complete tested workflow:
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite
```

<<<<<<< HEAD
Run the final gate after install:
=======
Run the final health gate:
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![Tested Workflow](https://img.shields.io/badge/tested-Codex%20CLI%20%2B%20Windows%20app-111827)](#tested-environment)

**AI Code Intelligence Toolkit** gives AI-assisted coding a safer operating layer inside real repositories. It adds a local GraphRAG-style code graph, task preflight, patch boundaries, generated-file leak checks, and repo instructions that fit a Codex-compatible `AGENTS.md` workflow.

It is for developers who use AI assistants to code and want fewer wrong-file edits, less drift, clearer validation, and faster repo understanding.

It is **not** a token-saving product. Any token or cost reduction is only a side effect of better precision: fewer irrelevant files read, narrower patch scope, and healthier source navigation.

---

<<<<<<< HEAD
## Required companion links

```txt
AI Code Intelligence Toolkit:
https://github.com/xraisen/ai-code-intelligence-toolkit

TypeDoc Hybrid Source Links:
https://github.com/xraisen/typedoc-hybrid-source-links
```

**AI Code Intelligence Toolkit can run by itself** for GraphRAG, `ai:spec`, `ai:preflight`, graph doctor, and leak checks.

**TypeDoc Hybrid Source Links can run by itself** for TypeDoc local/GitHub source-link generation.

**They are designed to work best together.** The benchmark, health checks, and guarded Codex-compatible workflow described below are based on using **AI Code Intelligence Toolkit + TypeDoc Hybrid Source Links together**.

---

=======
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138
## What this toolkit does

```txt
ai:spec              Creates a task spec before coding
ai:preflight         Returns allowed read files, allowed patch files, and validation commands
ai:graph:build       Builds a fast local code graph
ai:graph:query       Finds related files, symbols, docs, and read commands
ai:graph:doctor      Checks whether the graph and scripts are healthy
ai:graph:check-leaks Blocks generated/build/archive files from becoming source truth
mcp:code-intel       Starts a minimal MCP-ready code intelligence stdio server
typedoc:*            Optional TypeDoc local/GitHub source-link workflow
```

---

## Tested environment

This release is tested for package health using:

```txt
Node.js >= 20
npm pack --dry-run
node --check for every .mjs file
npm run smoke
installer smoke test
false-positive TypeDoc source-link fixture
```

The intended AI workflow is documented for:

```txt
Codex CLI
Codex Windows app workflow
Windows repository worktree
Node.js >= 20
```

Other assistants may use the same npm scripts because they are plain Node.js commands, but this README does not claim those workflows are tested.

---

## Install

```bash
npm install --save-dev ai-code-intelligence-toolkit
npx ai-code-intel-install --target . --overwrite
```

For the complete workflow:

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite
```

---

## Empty-folder behavior

Running the health scripts in an empty folder before installation is not a valid project test. The toolkit is an installer plus repo workflow. A target project must have at least a `package.json`, installed scripts, and source files for meaningful graph output.

Correct empty-folder smoke test:

```bash
mkdir test-toolkit
cd test-toolkit
npm init -y
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite
npm run typedoc:health
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

Expected result in a truly empty repo:

```txt
typedoc:health can pass because the tool files exist.
ai:graph:build can run.
ai:graph:doctor may warn or fail if the graph has too few useful source nodes.
```

That is correct. A graph doctor should not call an empty folder a healthy real project.

---

<<<<<<< HEAD
## Real-project health gate

Use this after install in an actual repo:

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
=======
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
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

Meaning:

```txt
typedoc:health        Tooling files are present and local TypeDoc JSON is not polluted by GitHub blob source URLs
typedoc:json:local    Generates AI-readable TypeDoc JSON with local vscode://file links
typedoc:check-local   Confirms local TypeDoc JSON does not contain public GitHub blob source URLs
ai:graph:build        Builds .ai/code-graph/graph.json
ai:graph:doctor       Confirms graph, scripts, source-truth files, and TypeDoc source-link mode
ai:graph:check-leaks  Confirms generated/build/archive/mobile-public files are not graph truth
```

---

## Package scripts added to the target repo

```json
{
  "ai:spec": "node scripts/ai/spec-preflight.mjs",
  "ai:preflight": "node scripts/ai/codex-preflight.mjs",
  "ai:graph:build": "node scripts/graphrag/build-code-graph.mjs --fast",
  "ai:graph:build:fast": "node scripts/graphrag/build-code-graph.mjs --fast",
  "ai:graph:build:minimal": "node scripts/graphrag/build-code-graph.mjs --minimal",
  "ai:graph:build:full": "node scripts/graphrag/build-code-graph.mjs --full --include-tests",
  "ai:graph:query": "node scripts/graphrag/query-code-graph.mjs",
  "ai:graph:doctor": "node scripts/graphrag/doctor.mjs",
  "ai:graph:check-leaks": "node scripts/graphrag/check-no-leaks.mjs",
  "ai:graph:health": "npm run ai:graph:build && npm run ai:graph:doctor && npm run ai:graph:check-leaks",
  "mcp:code-intel": "node mcp/codebase-intelligence-server.mjs",
  "typedoc:config:auto": "node scripts/typedoc-source-config.mjs auto typedoc.json",
  "typedoc:config:local": "node scripts/typedoc-source-config.mjs local typedoc.json",
  "typedoc:config:github": "node scripts/typedoc-source-config.mjs github typedoc.json",
  "typedoc:frontend:config:local": "node scripts/typedoc-source-config.mjs local typedoc-frontend.json",
  "typedoc:frontend:config:github": "node scripts/typedoc-source-config.mjs github typedoc-frontend.json",
  "typedoc:json": "npm run typedoc:json:auto",
  "typedoc:json:auto": "npm run typedoc:config:auto && npx --no-install typedoc --json typedoc-api.json --options typedoc.auto.generated.json",
  "typedoc:json:local": "npm run typedoc:config:local && npx --no-install typedoc --json typedoc-api.json --options typedoc.local.generated.json",
  "typedoc:json:github": "npm run typedoc:config:github && npx --no-install typedoc --json typedoc-api.github.json --options typedoc.github.generated.json",
  "typedoc:html:auto": "npm run typedoc:config:auto && npx --no-install typedoc --options typedoc.auto.generated.json",
  "typedoc:html:local": "npm run typedoc:config:local && npx --no-install typedoc --options typedoc.local.generated.json",
  "typedoc:html:github": "npm run typedoc:config:github && npx --no-install typedoc --options typedoc.github.generated.json",
  "typedoc:frontend:html:github": "npm run typedoc:frontend:config:github && npx --no-install typedoc --options typedoc-frontend.github.generated.json",
  "typedoc:health": "node scripts/typedoc-tool-health.mjs",
  "typedoc:doctor": "node scripts/typedoc-tool-health.mjs",
  "typedoc:check-local": "node scripts/ai/typedoc-local-source-check.mjs",
  "typedoc:strict": "TYPEDOC_STRICT=true npx --no-install typedoc --options typedoc-strict.json",
  "docs:typedoc": "npm run typedoc:html:auto",
  "typedoc:final-health": "npm run typedoc:health && npm run typedoc:json:local && npm run typedoc:check-local",
  "ai:final-health": "npm run typedoc:health && npm run typedoc:json:local && npm run typedoc:check-local && npm run ai:graph:build && npm run ai:graph:doctor && npm run ai:graph:check-leaks",
  "toolkit:final-health": "npm run ai:final-health"
}
```

---

## Mandatory anti-drift AI coding loop

This is the required loop for every task. It is designed to avoid drift by forcing the assistant to refresh local docs, rebuild the graph, locate exact symbols/files, and run preflight before touching source code.

### Step 1: refresh local context first

Always run this first and wait for it to finish:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

This gives the assistant fresh local TypeDoc JSON and a fresh `.ai/code-graph/graph.json` for the current repository state.

### Step 2: create the task spec

Use `ai:spec` to define the goal and routing before reading implementation files:

```bash
npm run ai:spec -- "<task>"
```

Example:

```bash
npm run ai:spec -- "fix the campaign budget form saving the wrong value"
```

### Step 3: query the exact symbol, file, error, route, table, hook, validator, or feature

Use `ai:graph:query` to locate files before opening or editing them:

```bash
npm run ai:graph:query -- "<specific symbol/file>"
```

Examples:

```bash
npm run ai:graph:query -- "CampaignBudgetForm save handler"
npm run ai:graph:query -- "src/components/CampaignBudgetForm.tsx"
npm run ai:graph:query -- "validateBudget"
npm run ai:graph:query -- "Supabase campaign table update error"
```

### Step 4: run preflight before patching

Use `ai:preflight` to get allowed read files, allowed patch files, validation commands, and stop rules:

```bash
npm run ai:preflight -- "<task>"
```

Example:

```bash
npm run ai:preflight -- "fix the campaign budget form saving the wrong value"
```

### Step 5: edit only after the contract is clear

```txt
1. Use AI_GROUND_TRUTH.md as the directory/contract map.
2. Use AI_SYMBOL_INDEX.json as the symbol dictionary.
3. Use .ai/code-graph/graph.json only after the graph was rebuilt in the current cycle.
4. Read only the bounded context returned by ai:graph:query.
5. Patch only files returned in allowedPatchFiles.
6. Run the validation commands returned by preflight.
```

### Step 6: after any modification, refresh again before the next edit cycle

After source modifications, rerun:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then rerun:

```bash
npm run ai:spec -- "<task>"
npm run ai:graph:query -- "<specific symbol/file>"
npm run ai:preflight -- "<task>"
```

---

<<<<<<< HEAD
## PowerShell context contract

When working inside Windows PowerShell, use `Select-String` for bounded context. This prevents dumping large files into the assistant and keeps the work tied to the exact symbol or problem.

First check the source-truth files:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
```

Then check only the exact file returned by `ai:graph:query`:

```powershell
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Do not use broad `Get-Content` file dumps or broad `rg` searches as the first repo-navigation move. Use another command only after `ai:graph:query` returns an exact file and `Select-String` cannot expose the needed bounded context.

---

## Use case scenario examples

### Scenario 1: normal bug fix

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "fix login redirect looping after successful auth"
npm run ai:graph:query -- "login redirect auth success handler"
npm run ai:preflight -- "fix login redirect looping after successful auth"
```

Expected assistant behavior:

```txt
1. Read AGENTS.md, README.md, AI_GROUND_TRUTH.md, and AI_SYMBOL_INDEX.json first.
2. Use graph query results to locate the exact auth handler or route file.
3. Use Select-String bounded context for the exact symbol.
4. Patch only allowedPatchFiles.
5. Run returned validation commands.
6. Rebuild typedoc local JSON and graph after the patch.
```

### Scenario 2: feature change

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "add validation before campaign budget submit"
npm run ai:graph:query -- "campaign budget validation submit handler"
npm run ai:preflight -- "add validation before campaign budget submit"
```

### Scenario 3: graph or toolkit fix

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "make graph query return Select-String instead of Get-Content"
npm run ai:graph:query -- "query-code-graph readCommands"
npm run ai:preflight -- "make graph query return Select-String instead of Get-Content"
```

### Scenario 4: unknown error text

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "investigate runtime error without editing yet"
npm run ai:graph:query -- "paste the exact error message or stack symbol here"
npm run ai:preflight -- "prepare smallest safe patch for the runtime error"
```

---

## v1.0.6 fixes included

```txt
1. Companion links are visible in root README, installed README section, and AGENTS snippet.
2. TypeDoc scripts use npx --no-install typedoc instead of an internal TypeDoc binary path.
3. Graph leak checks exclude generated/build/output/mobile-public/archive paths.
4. Graph doctor checks TypeDoc source URLs only, not arbitrary JSON text, preventing false GitHub-blob positives.
5. Empty-folder behavior is documented as an installer smoke test, not a real graph-health proof.
6. Final health scripts are included: ai:final-health and toolkit:final-health.
7. Publish instructions are included with smoke and pack dry-run before npm publish.
8. v1.0.6 revised workflow adds mandatory TypeDoc local JSON + graph rebuild before every edit cycle.
9. ai:spec, ai:preflight, and ai:graph:query now output the Select-String PowerShell context contract.
```

---

## Publish

```bash
npm whoami
npm run smoke
npm pack --dry-run
npm publish --access public
npm view ai-code-intelligence-toolkit version
```

Expected version after publish:

```txt
1.0.6
```

---

## Trademark and affiliation notice

This package is an independent developer workflow package. It is not affiliated with, endorsed by, or certified by OpenAI, GitHub, TypeDoc, Microsoft, or any other vendor referenced in examples.
=======
## License

MIT.
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138
