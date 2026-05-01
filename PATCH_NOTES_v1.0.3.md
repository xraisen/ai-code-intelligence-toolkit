# v1.0.3 patch notes

This patch fixes TypeDoc local JSON generation for repositories that do not have a root `tsconfig.json` or a `src/` folder yet.

## Fixed

- `tsconfig.doc.json` is now self-contained and no longer extends `./tsconfig.json`.
- TypeDoc configs now point to `./tsconfig.doc.json` consistently.
- `typedoc-source-config.mjs` now filters missing entry points and falls back to existing folders such as `scripts`, `bin`, `mcp`, or `templates/scripts`.
- If no TypeScript/JavaScript entry folder exists yet, the generator creates `.ai/typedoc/empty-entry.ts` so `typedoc:json:local` can complete during initial setup checks.

## Publish

Since `1.0.2` is already published, publish this as `1.0.3`:

```bash
npm version patch
npm publish --access public
```
