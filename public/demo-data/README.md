# TrustLane Public Evidence Pack

This directory contains static, sanitized TrustLane evidence artifacts for public inspection. Every JSON file uses the same versioned envelope and is generated offline by `scripts/generate-public-evidence.mjs` from a browser-exported TrustLane demo state.

The current repository pack was generated from a genuine sanitized browser export. Its recorded state is **Authorized / Awaiting Merchant Execution**, which remains non-terminal and is not presented as a completed payment. To regenerate the pack from a newer genuine export:

```bash
npm run evidence:generate -- ./path/to/trustlane-demo-state-YYYY-MM-DD.json
npm run evidence:validate
```

The generator performs no network requests and never calls OpenAI, Senso, Prava, checkout, callback, or payment endpoints. Payment completion is never inferred.

## Artifacts

- `latest-research.json`
- `latest-decision-ledger.json`
- `agent-execution-log.json`
- `latest-order-attempt.json`
- `verification-lifecycle.json`
- `trust-replay.json`
- `merchant-passport.json`
- `evidence-bundle.json`
- `schema.json`
