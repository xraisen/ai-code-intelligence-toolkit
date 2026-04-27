# Validation Report — v1.0.2

Validated package health checks performed in the packaging environment.

## Scope

- README updated with evidence-safe benchmark wording.
- Product names use actual names only.
- Claims limited to Codex CLI and Codex Windows app workflow.
- Trademark/affiliation notice added.
- Benchmark images regenerated without vendor logos.
- Old duplicate benchmark image filenames removed.
- Token/cost positioning corrected: precision first; lower exposure is a side effect.

## Packaged images

- `docs/assets/codex-windows-tested-benchmark.png`
- `docs/assets/precision-workflow-diagram.png`


## Automated validation

FAILED

- README.md: contains banned wording official OpenAI

## Automated validation

FAILED

- README.md: contains banned wording official OpenAI

## Automated validation v1.0.2 final

PASS

- README wording check: PASS
- Image path check: PASS
- package.json parse: PASS
- benchmark.json parse: PASS
- node --check all `.mjs` files: PASS
- npm run smoke: PASS
