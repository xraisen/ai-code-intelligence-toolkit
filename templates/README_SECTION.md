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

<<<<<<< HEAD
### Mandatory anti-drift startup

Before reading implementation files or editing source code, always run and wait for this to finish:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then run the task contract:

```bash
npm run ai:spec -- "<task>"
npm run ai:graph:query -- "<specific symbol/file/error/feature>"
npm run ai:preflight -- "<task>"
```

Use `AI_GROUND_TRUTH.md` as the repo directory/contract map and `AI_SYMBOL_INDEX.json` as the symbol dictionary before touching files.

### PowerShell context rule

Use targeted `Select-String` before editing:

```powershell
Select-String -Path "AI_GROUND_TRUTH.md","AI_SYMBOL_INDEX.json" -Pattern "<symbol or file>" -SimpleMatch -Context 4,8
Select-String -Path "<exact-file-from-graph-query>" -Pattern "<specific-symbol-or-phrase>" -SimpleMatch -Context 40,60
```

Avoid broad `Get-Content` file dumps and broad `rg` searches as the first navigation step. The point is to keep context bounded and avoid drift.

### Example use cases

Bug fix:

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "fix the dashboard save button not updating state"
npm run ai:graph:query -- "DashboardSaveButton save handler"
npm run ai:preflight -- "fix the dashboard save button not updating state"
```

Feature change:

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "add validation before campaign budget submit"
npm run ai:graph:query -- "campaign budget validation submit handler"
npm run ai:preflight -- "add validation before campaign budget submit"
```

Tooling or graph issue:

```bash
npm run typedoc:json:local && npm run ai:graph:build
npm run ai:spec -- "fix graph query returning broad file dumps"
npm run ai:graph:query -- "query-code-graph readCommands"
npm run ai:preflight -- "fix graph query returning broad file dumps"
```

=======
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138
### Final health gate

```bash
npm run typedoc:health
npm run typedoc:json:local
npm run typedoc:check-local
npm run ai:graph:build
npm run ai:graph:doctor
npm run ai:graph:check-leaks
```

<<<<<<< HEAD
After modifications, rerun:

```bash
npm run typedoc:json:local && npm run ai:graph:build
```

Then rerun `ai:spec`, `ai:graph:query`, and `ai:preflight` before the next edit cycle.
=======
### Working loop

1. Run `npm run ai:graph:doctor` to confirm the local graph and required files are healthy.
2. Run `npm run ai:preflight -- "describe the work"` to get a bounded patch plan and validation commands.
3. Use `npm run ai:graph:query -- "symbol or feature name"` to locate the right files before editing.
4. Apply the smallest possible change and validate using the commands returned by preflight.
5. Finish with `npm run ai:graph:check-leaks` to keep generated output out of source files.

### Tested positioning

Tested with Codex CLI and Codex Windows app workflow. Other assistants may run the same npm scripts, but this release is not claiming all assistants are tested.
>>>>>>> 4e1b796e6def765beb5e3edbe89a48d4420cb138
