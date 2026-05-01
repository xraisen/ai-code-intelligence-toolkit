# AI Code Intelligence Toolkit v1.0.6

## Fixes

- Raised package version to `1.0.6`.
- Preserved visible companion links in root README, installed README section, and AGENTS snippet.
- Preserved `npx --no-install typedoc` for TypeDoc CLI calls instead of internal TypeDoc binary paths.
- Added final health scripts for repeatable validation.
- Added false-positive-safe TypeDoc source-link inspection by collecting `source.url` values only.
- Documented empty-folder testing correctly: installer smoke can pass, but graph/doc health requires a real project.

## Final gate

```bash
npm run smoke
npm pack --dry-run
```

## Revised anti-drift workflow addendum

- Added mandatory `npm run typedoc:json:local && npm run ai:graph:build` startup before source reads and edits.
- Added explicit `ai:spec`, `ai:graph:query`, and `ai:preflight` task examples.
- Added PowerShell `Select-String` context contract to README, AGENTS snippet, AI_GROUND_TRUTH, ai:spec, ai:preflight, and ai:graph:query output.
- Updated `ai:graph:query` to return `Select-String` bounded context commands instead of broad `Get-Content` commands for PowerShell.
