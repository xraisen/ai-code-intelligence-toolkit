# AI Code Intelligence Toolkit

Local AI-agent tooling for JavaScript and TypeScript repositories.

**Ground Truth first. Graph second. Patch smallest. Validate focused.**

This toolkit gives you a local GraphRAG-style code graph, smart preflight routing, spec-driven execution helpers, generated-file leak checks, MCP-compatible code intelligence, and TypeDoc source-link support for AI-friendly API context.

## Showcase Scenario

You inherit a medium-sized TypeScript repo with scattered utilities, stale docs, and no clear entry point.

The workflow looks like this:

1. Run `npm run ai:graph:doctor` to confirm the graph and contract files are healthy.
2. Run `npm run ai:preflight -- "add a retryable API client"` to get a focused file set, patch scope, and validation commands.
3. Use `npm run ai:graph:query -- "retry client"` to trace the relevant symbols before editing.
4. Implement the smallest possible patch, then validate with the commands returned by preflight.
5. Finish with `npm run ai:graph:check-leaks` so generated output does not slip into source control.

The result is a disciplined loop:

- faster repo orientation
- fewer blind edits
- clearer validation
- safer handoff to humans and agents

When the toolkit is installed into another repository, that same flow turns into a repeatable operating model instead of an ad hoc search exercise.

## Prerequisite

For full TypeDoc source-link behavior, the target repository should also use
[typedoc-hybrid-source-links](https://github.com/xraisen/typedoc-hybrid-source-links).
That package provides the local VS Code links, public GitHub links, and health checks this toolkit expects.

Without it, the TypeDoc commands still work, but the local-vs-public link behavior will be incomplete.

## Features

- Fast local graph generation with bounded scanning.
- Graph queries that return related files, symbols, relationships, and safe read commands.
- Health checks for graph artifacts, required scripts, required files, and generated-output leaks.
- Smart `ai:preflight` routing that returns allowed read files, allowed patch files, forbidden hints, and validation commands.
- `ai:spec` output for implementation planning and drift control.
- TypeDoc hybrid source links: local docs open in VS Code, public docs open in GitHub.
- An installer that injects package scripts and optional AGENTS/README instructions into an existing repository.
- Zero runtime npm dependencies for the AI tooling scripts.

## Use Cases

- Large TypeScript repos where agents need a short path from intent to the right files.
- Multi-package codebases that need targeted patching instead of broad repository scanning.
- Public API docs that should stay editor-friendly locally and resolve to GitHub when published.
- Teams that want a repeatable preflight before patching so every run starts from the same ground truth.
- New contributors or assistants who need a clear source-of-truth order before editing.

## Where It Helps Most

- Faster repo orientation: graph queries cut down blind search across the tree.
- Less patch drift: `ai:preflight` narrows the allowed files before edits start.
- Better docs navigation: local TypeDoc links open in the editor, while public docs point at GitHub blobs.
- Safer agent work: leak checks catch generated output or noisy files before they get treated as source.

## Showcase Scenario

Imagine a TypeScript monorepo with a broken API doc link, a failing generated-file check, and a request to update one service without touching the rest of the tree.

With this toolkit, the workflow becomes:

1. Run `ai:preflight` to identify the exact files that matter.
2. Use the graph query command to jump from the user request to the right symbols and source files.
3. Patch the smallest possible scope.
4. Run the validation commands to confirm the graph, leak checks, and TypeDoc workflow still hold.

Why this is valuable:

- The agent stays anchored to repository truth instead of guessing from search results.
- The patch stays small enough to review quickly.
- The docs path remains split correctly: local development opens source in VS Code, while public docs resolve to GitHub.
- The repo stays safer because generated output is checked before it can pass as source.

In practice, that means less time spent navigating, less accidental drift, and a better documentation experience for both humans and AI tools.

## Install into another repo

```bash
node bin/install.mjs --target /path/to/your/repo --overwrite
```

After publishing:

```bash
npm install --save-dev ai-code-intelligence-toolkit
npx ai-code-intel-install --target . --overwrite
```

## Installed commands

```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
npm run mcp:code-intel
```

## Bundled TypeDoc prerequisite

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run typedoc:json:github
npm run typedoc:html:github
```

## Validation And Benchmark Note

This project does not claim a synthetic speed benchmark.
The honest measurement here is functional validation:

- The top-level [validation report](./VALIDATION_REPORT.md) records the smoke checks that were run.
- The upstream prerequisite repository documents the hybrid source-link behavior this toolkit relies on:
  [typedoc-hybrid-source-links](https://github.com/xraisen/typedoc-hybrid-source-links).

That makes the claim auditable: the toolkit is validated by commands and artifacts, not by a fabricated performance number.

## Smoke test

```bash
npm run smoke
```

## License

MIT License for public use.

Copyright (c) 2026 Jose
