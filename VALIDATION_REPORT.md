<<<<<<< HEAD
# Validation Report v1.0.6 revised

## Result

PASS for package-level validation performed in this environment.

## AI Code Intelligence Toolkit checks

- Manual `node --check` passed for all package `.mjs` files.
- `ai:spec` outputs the mandatory `npm run typedoc:json:local && npm run ai:graph:build` startup contract.
- `ai:preflight` outputs the mandatory before-edit contract, allowed read files, allowed patch files, validation commands, stop rules, and PowerShell contract.
- `ai:graph:query` returns PowerShell `Select-String` bounded context commands instead of broad `Get-Content` commands.
- `AI_GROUND_TRUTH.md`, `AI_SYMBOL_INDEX.json`, README section, and AGENTS snippet include the anti-drift contract.
- `.tgz` package artifact was recreated with standard `package/` tarball prefix.

## Scope note

This is package-health validation. A target project still needs its own final gate after install:

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```
=======
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
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138
