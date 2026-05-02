# v1.0.8 Cumulative TypeDoc EntryPoint Fix

Fixes TypeDoc config generation for Vite/React/TypeScript projects and mixed repos that use `src`, `api`, `scripts`, or `mcp` folders.

## Fixed

- Preserves explicit `entryPoints` from `typedoc.json` instead of replacing them with directory fallbacks.
- Generates glob-based fallback entry points such as `src/**/*.ts` and `src/**/*.tsx`.
- Adds `entryPointStrategy: "expand"` to generated TypeDoc configs.
- Adds `tsconfig: "tsconfig.doc.json"` to generated TypeDoc configs.
- Expands `tsconfig.doc.json` includes for Vite, API routes, scripts, MCP files, and declaration files.

## Why

Some Vite projects use TypeScript project references, so TypeDoc can reject directory entry points such as `src` with:

```txt
The entry point ./src is not referenced by the 'files' or 'include' option in your tsconfig
Unable to find any entry points.
```

This patch prevents the generator from drifting back to broken directory-only entry points.
