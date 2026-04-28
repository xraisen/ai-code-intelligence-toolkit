# AI Code Intelligence Toolkit Validation Report

Validated release target: v1.0.5

## Required companion links

- AI Code Intelligence Toolkit: https://github.com/xraisen/ai-code-intelligence-toolkit
- TypeDoc Hybrid Source Links: https://github.com/xraisen/typedoc-hybrid-source-links

## Required final health gate

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

## Result required for release

All commands must return `ok: true`, `typedoc:check-local` must have no errors, and `ai:graph:check-leaks` must report `leakCount: 0`.
