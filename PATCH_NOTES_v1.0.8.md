# Patch Notes v1.0.8

## Agent edit permission fix

The AI-agent contract now makes the anti-drift commands mandatory without turning preflight output into a hard patch whitelist.

The agent must run:

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "<task>"
npm run ai:preflight -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
```

After that workflow completes, the agent is allowed to edit every repository file required to complete the requested task correctly.

## Installer hardening

- Replaces old managed blocks.
- Removes legacy AI Code Intelligence Toolkit sections without reliable markers.
- Repairs corrupted generated sections with Git conflict markers.
- Preserves project-specific content outside the generated block.
- Fails strict mode if conflict markers remain after repair.

## Searchable tool names

Added readable aliases:

- `ai:context:refresh`
- `ai:task:spec`
- `ai:task:preflight`
- `ai:context:find`
- `ai:context:doctor`
- `ai:context:leak-check`
- `ai:contract:inject`
- `ai:health:final`

Existing compatibility commands remain unchanged.
