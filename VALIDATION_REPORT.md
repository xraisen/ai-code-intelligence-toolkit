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
