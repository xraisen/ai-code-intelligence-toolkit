# v1.0.7 Patch Notes

- Added repair-aware managed contract injection for AGENTS.md and README.md.
- Added scripts/ai/inject-agent-contract.mjs, npm run ai:inject-contract, and npm run ai:repair-contract.
- Installer now repairs corrupted generated sections containing Git conflict markers and preserves project-specific content outside the managed block.
- Injected instructions include concrete use-case scenarios for ai:spec, ai:graph:query, and ai:preflight.
- Strengthened PowerShell navigation contract to use Select-String before edits.
