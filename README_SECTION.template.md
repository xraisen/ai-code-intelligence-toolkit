## AI Code Intelligence Toolkit

Local AI-agent tooling for source-of-truth navigation, GraphRAG-style code graph generation, smart preflight routing, and hybrid TypeDoc source links.

## Prerequisite

For full TypeDoc source-link behavior, install
[typedoc-hybrid-source-links](https://github.com/xraisen/typedoc-hybrid-source-links)
in the target repository. Local docs open in VS Code and public docs open in GitHub only when that prerequisite is present.

```bash
npm run ai:spec -- "task description"
npm run ai:preflight -- "task description"
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
npm run ai:graph:query -- "specific symbol, file, route, error, or feature"
npm run typedoc:health
```
