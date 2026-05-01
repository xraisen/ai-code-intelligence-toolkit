# AI Code Intelligence Toolkit v1.0.5

Final companion-link and clean install polish release.

## Fixed

- Added visible companion links at the top of README.md.
- Added raw companion URLs inside installed README sections.
- Added companion URLs inside AGENTS snippets.
- Removed the installed README link to missing VALIDATION_REPORT.md to prevent TypeDoc warning noise in clean target folders.
- Kept the TypeDoc CLI fix using `npx --no-install typedoc` instead of an internal TypeDoc path.
- Added final health scripts for repeatable validation.

## Final health gate

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```
