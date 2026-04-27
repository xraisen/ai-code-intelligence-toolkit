## AI Code Intelligence Toolkit

Local AI-agent tooling for source-of-truth navigation, GraphRAG-style code graph generation, smart preflight routing, and hybrid TypeDoc source links.

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
