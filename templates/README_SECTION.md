## AI Code Intelligence Toolkit

Local AI-agent tooling for source-of-truth navigation, GraphRAG-style code graph generation, smart preflight routing, and hybrid TypeDoc source links.

### Showcase Scenario

Picture a repository that has grown organically: the paths are not obvious, the docs are stale, and new changes need to be made without widening the blast radius.

The toolkit turns that situation into a repeatable loop:

1. Run `npm run ai:graph:doctor` to confirm the local graph and required files are healthy.
2. Run `npm run ai:preflight -- "describe the work"` to get a bounded patch plan and validation commands.
3. Use `npm run ai:graph:query -- "symbol or feature name"` to locate the right files before editing.
4. Apply the smallest possible change and validate using the commands returned by preflight.
5. Finish with `npm run ai:graph:check-leaks` to keep generated output out of source files.

That flow gives contributors and agents the same source of truth: search less, patch less, validate more.

### Prerequisite

Full TypeDoc source-link behavior depends on
[typedoc-hybrid-source-links](https://github.com/xraisen/typedoc-hybrid-source-links)
in the consuming repository.
Without it, the TypeDoc commands can still exist, but local vs public source links
will not be complete.

### Use Cases

- Large TypeScript repos where agents need a short path from intent to the right files.
- Multi-package codebases that need targeted patching instead of broad repository scanning.
- Repositories with public API docs where local source links should stay editor-friendly while published docs should resolve to GitHub.
- Teams that want a repeatable preflight before patching, so the agent sees the same ground truth every time.

### Honest Validation

This toolkit is validated by smoke checks, not by a synthetic performance benchmark.
See [VALIDATION_REPORT.md](VALIDATION_REPORT.md) for the commands that were run.

```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
npm run typedoc:health
```
