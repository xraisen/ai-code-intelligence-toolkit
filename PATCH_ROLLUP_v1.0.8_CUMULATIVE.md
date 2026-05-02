# v1.0.8 Cumulative Complete Release

This v1.0.8 package is a jump release. It carries the previous patch work forward into one publish-ready version so you do not need to apply older overlays first.

## Included old fixes

| Area | Included in this v1.0.8 release |
|---|---|
| Package manifest repair | Clean `package.json` files with no unresolved merge artifacts. |
| TypeDoc hybrid source links | Local VS Code links, GitHub blob links, strict TypeDoc runner, and source-link doctor. |
| TypeDoc false-positive guard | Source-link checks inspect actual TypeDoc source URL fields instead of unrelated JSON text. |
| Anti-drift startup contract | Requires `typedoc:json:local` plus `ai:graph:build` before source edits. |
| Task planning contract | Requires `ai:spec`, `ai:preflight`, and `ai:graph:query` before edits. |
| PowerShell token conservation | Uses targeted `Select-String` context windows before broad reads. |
| AGENTS.md / README.md injector | Injects and repairs managed AI contract blocks while preserving project content. |
| Edit permission fix | AI agents may edit every necessary project file after completing discovery; preflight is advisory, not a hard whitelist. |
| Searchable aliases | Adds easy tool names such as `ai:context:refresh`, `ai:context:find`, and `ai:health:final`. |
| Durable AI changelog memory | Seeds and maintains `docs/ai-changelog/START_HERE.md` plus `history.index.json`. |
| Smart validation memory | Adds `ai:test:smart` to avoid repeating identical successful tests against unchanged code. |

## Required AI coding loop

```bash
npm run ai:history:status
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

After discovery finishes, the agent may edit all necessary files. The contract is for context, drift prevention, and token conservation, not for blocking required edits.

## After modifications

```bash
npm run ai:test:smart -- "npm run build"
npm run ai:test:smart -- "npm run test"
npm run ai:history:add -- --task "<task>" --summary "<what changed>" --files "file1,file2" --validation "npm run build"
npm run ai:final-health
```

## Important behavior

- `docs/ai-changelog/START_HERE.md` is the lookback directory.
- `docs/ai-changelog/history.index.json` is the machine-readable issue/fix index.
- Numbered changelog markdown files preserve what was fixed so future AI agents do not accidentally return the project to an older broken state.
- `ai:test:smart` skips only when the same validation already passed for the same unchanged repository fingerprint.

## Publish order

Publish `typedoc-hybrid-source-links` first, then `ai-code-intelligence-toolkit`.

## TypeDoc entrypoint compatibility patch

- Preserves explicit TypeDoc glob entry points.
- Adds `entryPointStrategy: "expand"` and `tsconfig: "tsconfig.doc.json"` to generated configs.
- Uses glob fallbacks instead of bare directory fallbacks to support Vite/React/TypeScript project-reference layouts.
