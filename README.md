# AI Code Intelligence Toolkit

Reusable local AI-agent tooling for JavaScript/TypeScript repositories.

**Ground Truth first. Graph second. Patch smallest. Validate focused.**

This toolkit installs a local GraphRAG-style code graph, smart preflight routing, spec-driven execution helpers, generated-file leak checks, MCP-compatible code intelligence, and the TypeDoc source-link workflow needed for AI-friendly API context.

## Prerequisite

This toolkit is fully effective when the target repository also uses
[typedoc-hybrid-source-links](https://github.com/xraisen/typedoc-hybrid-source-links).
That package provides the hybrid local/GitHub TypeDoc source-link generation,
health checks, and AI-safe docs output that this toolkit expects.

Without it, the TypeDoc commands can still exist, but the local-vs-public source-link
behavior documented here will be incomplete.

## Features

- Fast local code graph generation with bounded scanning.
- Graph query command that returns related files, symbols, relationships, and safe read commands.
- Health checks for graph artifacts, required scripts, required files, and generated-output leaks.
- Smart `ai:preflight` routing that returns allowed read files, allowed patch files, forbidden hints, and validation commands.
- `ai:spec` output for implementation planning and drift control.
- TypeDoc hybrid source links: local docs open in VS Code; public docs open in GitHub.
- Installer that injects package scripts and optional AGENTS/README instructions into an existing repository.
- Zero runtime npm dependencies for the AI tooling scripts.

## Use Cases

- Large TypeScript repos where agents need a short path from intent to the right files.
- Multi-package codebases that need targeted patching instead of broad repository scanning.
- Repositories with public API docs where local source links should stay editor-friendly while published docs should resolve to GitHub.
- Teams that want a repeatable preflight before patching, so the agent sees the same ground truth every time.
- Onboarding new contributors or assistants into a codebase that benefits from a clear source-of-truth order.

## Where It Helps Most

- Faster repo orientation: graph queries reduce blind search across the tree.
- Less patch drift: `ai:preflight` narrows the allowed files before edits start.
- Better docs navigation: local TypeDoc links open in the editor, while public docs point at GitHub blobs.
- Safer agent work: leak checks catch generated output or noisy files before they get treated as source.

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
