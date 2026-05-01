# Patch Notes v1.0.4

## Fix

- Replaced hardcoded internal TypeDoc CLI path (`./the old internal TypeDoc binary path`) with the public local npm binary call (`npx --no-install typedoc`).
- Keeps `typedoc:json:local`, `typedoc:check-local`, `typedoc:html:*`, and `typedoc:strict` compatible with current TypeDoc package layouts.
- Preserves the v1.0.3 `tsconfig.doc.json` circularity fix and entry point fallback behavior.

## Why

Some TypeDoc versions do not expose `the old internal TypeDoc binary path`.
Calling the npm binary is the stable supported CLI path after TypeDoc is installed locally.
