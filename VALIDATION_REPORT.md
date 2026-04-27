# Release Validation Report

Generated for the fresh GitHub-ready first release packages.

## Packages

- `ai-code-intelligence-toolkit`
- `typedoc-hybrid-source-links`

## Checks Run

```bash
find . -name '*.mjs' -print0 | xargs -0 node --check
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"
node -e "JSON.parse(require('fs').readFileSync('templates/package.scripts.json','utf8'))"
npm run smoke
```

## Result

- `typedoc-hybrid-source-links`: PASS
- `ai-code-intelligence-toolkit`: PASS

## Smoke Test Coverage

`typedoc-hybrid-source-links` installed into a temporary fixture and ran:

```bash
npm run typedoc:health
```

`ai-code-intelligence-toolkit` installed into a temporary fixture and ran:

```bash
npm run typedoc:health
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

## Sanitization

The packages were rebuilt as generic publishable repos with fresh README.md, AGENTS snippets, MIT license, and no app-specific documentation content.
