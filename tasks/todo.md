# AgentProof Level 1 Build Tracker

## Current Build Plan

- [x] Read PRD and design documents.
- [x] Lock production architecture: AWS-only, OpenAI, Sarvam-ready, no Gemini, no Firebase.
- [x] Scaffold Next.js App Router foundation.
- [x] Add design tokens, typography, and base UI shell.
- [x] Add core domain types for agents, contracts, tests, runs, evidence, scores, and billing.
- [x] Add environment contract for AWS, OpenAI, Sarvam, and Dodo credentials.
- [x] Add API route skeletons for Level 1 product flow.
- [x] Add async verification architecture placeholders for SQS and Lambda worker.
- [x] Add public/private report shell.
- [x] Run local TypeScript/build verification checks.
- [x] Complete landing-aligned proof-surface design pass across all Level 1 screens.
- [x] Verify desktop/mobile layout, reduced-motion CSS, and required route smoke tests.
- [x] Restore approved auth screen treatment and rebalance product typography against `DESIGN.md`.
- [x] Correct authenticated shell to fixed full-width navigation and normalize inner-page utility typography.
- [x] Convert the create-agent evaluation steps into a centered horizontal connected timeline.

## Decisions Locked

- AWS Amplify hosts the Next.js app.
- Cognito handles authentication.
- DynamoDB stores application data.
- S3 stores report and badge assets.
- SQS + Lambda run verification asynchronously.
- OpenAI is the only Level 1 LLM provider.
- Sarvam regional-language expansion is schema-ready in Level 1 and implemented after the English loop is stable.
- One Level 1 agent connector: `POST /run`.
- Public reports are dynamic pages backed by sanitized data.
- Level 1 uses polling for run progress.

## Review Notes

- First pass intentionally uses static sample data and credential-safe API stubs.
- Real AWS/OpenAI/Dodo calls are blocked until credentials and resource names are configured.
- `git diff --check` passed.
- Quarantined the broken partial install as `node_modules.partial`.
- `npm install --package-lock-only` and `npm ci` completed after the partial install was moved aside.
- `npm run typecheck` passed.
- `npm run build` passed.
- Local dev server started at `http://localhost:3000`.
- Smoke test passed: `/` returned HTTP 200.
- Smoke test passed: `/api/agents` returned sample agent data.
- Added shared proof UI primitives: `PageHeader`, `ProofPanel`, `MetricStrip`, `ContractWindow`, `TerminalWindow`, `EvidenceLedger`, `EvidenceRow`, `StepRail`, `ReportSheet`, and `ActionButton`.
- Replaced generic inner-page card layouts with operational registry, contract drafting, dossier, forensic console, report sheet, public report, pricing ledger, and restrained auth layouts.
- Local preview required quarantining a broken generated `.next` output entry caused by Windows/OneDrive reparse behavior; source files were not removed.
- Final route smoke test passed for all required Level 1 screens with HTTP 200 responses.
- Mobile preview checked at 390x844 with no horizontal overflow; browser console had no errors.
- Auth screens were restored to the prior restrained `lp-split-auth` design after review; Fraunces scale on product screens was reduced to section-title sizing.
- Final corrective build passed; local server restarted cleanly at `http://127.0.0.1:3000`.
- Product-shell correction verified visually on pricing and by HTTP smoke tests for landing, dashboard, create, pricing, and auth routes.
- Centered wizard timeline verified visually with connected nodes and a clean artifact boundary.

## Next Integration Slice

- Wire Cognito auth boundaries.
- Replace sample agent data with DynamoDB repository methods.
- Add OpenAI contract-draft service behind `POST /api/agents/:id/contract/draft`.
- Add SQS message publishing for `POST /api/agents/:id/run`.
