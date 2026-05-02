# v1.0.8 Final Drift-Hardened Patch

This keeps package version `1.0.8` and hardens the unpublished v1.0.8 release.

## Added

- Durable numbered AI changelog under `docs/ai-changelog/`.
- `docs/ai-changelog/START_HERE.md` directory for agent lookback.
- `docs/ai-changelog/history.index.json` machine-readable change index.
- `npm run ai:history:init`.
- `npm run ai:history:add -- --task "<task>" --summary "<what changed>"`.
- `npm run ai:history:status`.
- `npm run ai:history:refresh`.
- Smart validation memory via `npm run ai:test:smart -- "npm run test"`.
- Validation status via `npm run ai:test:status`.
- Cross-platform TypeDoc strict runner.

## Fixed

- Removed hard edit whitelist behavior.
- Added explicit contract that AI agents may edit every necessary file after anti-drift discovery.
- Prevented repeated identical validation runs when the repo fingerprint is unchanged.
- Preserved existing `docs/ai-changelog/history.index.json` during reinstall.
- Kept PowerShell token conservation contract based on `Select-String` bounded context.

## Required workflow

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

After important changes:

```bash
npm run ai:test:smart -- "npm run build"
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --validation "npm run build"
```
