## AI Code Intelligence Toolkit

Codex-compatible local code intelligence for source-of-truth navigation, GraphRAG-style code graph generation, smart preflight routing, generated-file leak checks, and hybrid TypeDoc source links.

### Required companion link

For the complete tested workflow, install this with **TypeDoc Hybrid Source Links**:

```txt
AI Code Intelligence Toolkit: https://github.com/xraisen/ai-code-intelligence-toolkit
TypeDoc Hybrid Source Links: https://github.com/xraisen/typedoc-hybrid-source-links
```

```bash
npm install --save-dev ai-code-intelligence-toolkit typedoc-hybrid-source-links typedoc
npx typedoc-hybrid-install --target . --overwrite
npx ai-code-intel-install --target . --overwrite
```

### Final health gate

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

### Working loop

1. Run `npm run ai:graph:doctor` to confirm the local graph and required files are healthy.
2. Run `npm run ai:preflight -- "describe the work"` to get a bounded patch plan and validation commands.
3. Use `npm run ai:graph:query -- "symbol or feature name"` to locate the right files before editing.
4. Apply the smallest possible change and validate using the commands returned by preflight.
5. Finish with `npm run ai:graph:check-leaks` to keep generated output out of source files.

### Tested positioning

Tested with Codex CLI and Codex Windows app workflow. Other assistants may run the same npm scripts, but this release is not claiming all assistants are tested.
