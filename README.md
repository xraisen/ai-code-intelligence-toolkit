# AI Code Intelligence Toolkit

Reusable local AI-agent tooling for JavaScript/TypeScript repositories.

**Ground Truth first. Graph second. Patch smallest. Validate focused.**

This toolkit installs a local GraphRAG-style code graph, smart preflight routing, spec-driven execution helpers, generated-file leak checks, MCP-compatible code intelligence, and the hybrid TypeDoc source-link tooling needed for AI-friendly API context.

## Features

- Fast local code graph generation with bounded scanning.
- Graph query command that returns related files, symbols, relationships, and safe read commands.
- Health checks for graph artifacts, required scripts, required files, and generated-output leaks.
- Smart `ai:preflight` routing that returns allowed read files, allowed patch files, forbidden hints, and validation commands.
- `ai:spec` output for implementation planning and drift control.
- TypeDoc hybrid source links bundled in: local docs open in VS Code; public docs open in GitHub.
- Installer that injects package scripts and optional AGENTS/README instructions into an existing repository.
- Zero runtime npm dependencies for the AI tooling scripts.

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

## Smoke test

```bash
npm run smoke
```

## License

MIT
# ai-code-intelligence-toolkit
