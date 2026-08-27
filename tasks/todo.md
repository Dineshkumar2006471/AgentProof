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
- Refined the public landing page into a light, evidence-driven system with Composio-inspired hierarchy and motion.

## Next Integration Slice

- Wire Cognito auth boundaries.
- Replace sample agent data with DynamoDB repository methods.
- Add OpenAI contract-draft service behind `POST /api/agents/:id/contract/draft`.
- Add SQS message publishing for `POST /api/agents/:id/run`.

## Production Backend Foundation

- [x] Add AWS CDK development stack for Cognito, DynamoDB, S3, SQS, Lambda, and IAM.
- [x] Add server-only AWS clients and environment output contract.
- [x] Implement complete custom Cognito auth flow with secure sessions.
- [x] Implement single-table DynamoDB repositories and owner isolation.
- [x] Replace remaining sample-data page reads with authenticated repositories.
- [x] Repair and harden OpenAI structured contract and test generation.
- [x] Implement authenticated endpoint credentials and deterministic fixture coverage.
- [x] Complete idempotent SQS worker evidence, scoring, and report flow.
- [x] Add automated unit, route-isolation, and worker tests.
- [x] Upgrade worker infrastructure to Node.js 22 and add production safeguards.
- [x] Deploy separate development and production AWS resources.
- [ ] Connect Amplify Hosting and complete the public HTTPS deployment.
- [ ] Run the open-beta readiness gate with at least three real agent endpoints.

## Production Readiness Slice

- [x] Fix OpenAI Structured Outputs schema rejection for contract drafting.
- [x] Return provider failures as safe, actionable API responses.
- [x] Enforce unique contract revisions and idempotent run processing.
- [x] Add per-agent endpoint authentication without browser exposure.
- [x] Add deterministic fixture scenarios for pass, boundary, timeout, malformed, and critical cases.
- [x] Replace sample-data dashboard, dossier, and report pages.
- [x] Add automated tests and development acceptance coverage.

## Review Notes: Production Readiness Slice

- OpenAI contract drafting now uses a Structured Outputs-compatible required schema and returns safe `502` provider errors.
- The complete English verification path is proven through the local deterministic fixture and deployed worker: queue, Lambda claim, evidence, score, and status.
- Critical-policy blocking and endpoint-unreachable failure behavior were verified independently.
- `npm run typecheck`, `npm test -- --run`, and `npm run build` pass.
- Development and production CDK stacks are deployed in `ap-south-1`.
- Amplify Hosting is not connected yet, so there is no public HTTPS URL and Dodo webhooks cannot be configured yet.
- Open-beta readiness still requires real external agent endpoints, production smoke tests, monitoring review, and rollback procedures.

## Open Beta Guardrails

- [x] Replace the invite-only/email-allowlist decision with public cohort sign-up and required email confirmation.
- [x] Add configurable per-account agent limits for beta environments.
- [x] Add configurable rolling 24-hour verification-run limits per agent.
- [x] Document the open-beta access model, limits, and launch gate in the README and `.env.example`.
- [ ] Enable beta limits in the deployed Amplify environment and confirm the expected `429` responses.
- [ ] Add a stable public HTTPS endpoint pack and test the full flow with at least two cohort accounts.
- [ ] Review CloudWatch queue, worker, OpenAI, and Cognito alarms before cohort onboarding.

## Landing Page Refinement Review

- Rebuilt the hero around a calm message center with animated evidence lanes, grid traces, signal bars, and verification markers.
- Replaced the generic ticker and audience card grid with a proof index and restrained editorial rows.
- Added a static verification report preview, evidence bridge band, technical CTA grid, and complete footer navigation.
- Preserved the existing header markup, AgentProof palette, typography, routes, and product functionality.
- Verified with `npm run typecheck`, `npm test -- --run`, `npm run build`, and `git diff --check`.
- Desktop and mobile preview checks passed with no observed horizontal overflow or browser errors; the only corrected preview warning was the logo aspect-ratio style warning.

## Production Repair Execution

- [x] Created `codex/production-repair` from the current local worktree without discarding existing frontend changes.
- [x] Reconnected sign-in, sign-up, email confirmation, forgot-password, reset-password, and sign-out UI to the existing Cognito API routes.
- [x] Reconnected the create-agent wizard to agent creation, OpenAI contract drafting, test generation, and SQS run creation.
- [x] Replaced dashboard sample agents with owner-scoped DynamoDB reads.
- [x] Replaced simulated verification progress with persisted run polling and evidence rendering.
- [x] Repaired the dynamic public report route and added owner-only JSON report export.
- [x] Restored missing shared product utility styles without changing the approved auth composition.
- [x] Normalized public routes to `[publicId]` and fixed route parameter typing.
- [x] Upgraded Next.js and its config to remove the three high-severity production audit findings; `npm audit --omit=dev --audit-level=high` now reports zero vulnerabilities.
- [x] Migrated the auth route guard from deprecated `middleware.ts` to the Next 16 `proxy.ts` convention.
- [x] Re-authenticated the `agentproof-dev` AWS SSO profile and verified the expected assumed role.
- [x] `npm run typecheck`, `npm test -- --run`, `npx eslint .`, `npm run build`, `npm run infra:synth`, and `npm run infra:synth:production` pass; lint has one non-blocking font warning.
- [x] Local server is running at `http://127.0.0.1:3002`.
- [ ] Connect Amplify Hosting and obtain a public HTTPS URL.
- [ ] Run the authenticated AWS end-to-end acceptance flow with a real endpoint.
- [ ] Test at least four real agent endpoints across two users, including one intentionally flawed endpoint.
- [ ] Configure Dodo webhook only after the Amplify HTTPS URL exists.

## Visual Quality Repair

- [x] Kept the mobile hero phrases on two intentional lines with a smaller fixed mobile headline size and defined spacing.
- [x] Uppercased the requested dashboard headings: verification workspace, latest reliability by agent, and your agents.
- [x] Replaced the wizard text separators with a centered node-and-connector progress track.
- [x] Added explicit registry grid columns so dashboard headers and rows remain aligned at desktop widths.
- [x] Tightened wizard timeline-to-artifact spacing and preserved the existing low-radius, thin-border language.
- [x] Made IBM Plex Mono the shared theme font for product and requested landing headings.
- [x] Added the requested 3px separation between the two hero claim lines.
- [x] Rebuilt and restarted the local preview after the visual changes.

## Beta Auth And Account UX

- [x] Repair sign-in error handling and distinguish expired AWS SSO credentials from Cognito authentication failures.
- [x] Make the shared AgentProof logo return to the public landing page and replace the global New Agent action with an account menu.
- [x] Add a protected individual profile page with account details and a working sign-out action.
- [x] Verify typecheck, tests, build, diff whitespace, route behavior, and responsive navigation.
- [x] Allow `localhost` and `127.0.0.1` as Next.js development origins so sign-in chunks and HMR are not returned as `403`.

## Internal Platform Redesign Execution

- [x] Replace the authenticated shell with the shared enterprise workspace navigation.
- [x] Add reusable KPI, table, filter, panel, and settings primitives without changing data contracts.
- [x] Migrate dashboard, dossier, creation, run, private report, public report, pricing, and profile surfaces.
- [x] Verify functionality, responsive behavior, accessibility states, and production build output.

### Internal Platform Redesign Review

- Shared `AppShell` now provides the desktop sidebar, mobile drawer, live context bar, profile menu, and sign-out entry point.
- Dashboard, dossier, run console, reports, pricing, profile, and agent creation use the same KPI, panel, table, status, and workflow language while retaining existing API calls and routes.
- `npm run typecheck`, `npm test -- --run`, `npm run build`, `npx eslint .`, and `git diff --check` pass.
- Local route smoke checks pass for `/`, `/pricing`, and `/auth/sign-in`; protected workspace routes return the expected unauthenticated `307` redirect.
- The in-app browser could not reach the host-local dev server even though PowerShell receives `200` from `http://127.0.0.1:3002/`; authenticated screenshot checks therefore remain unavailable until the browser can access the local server and a valid session is present.

### Open-Beta Commit Review

- Replaced the README with production setup guidance, plain-text architecture and user-flow diagrams, endpoint contract, deployment sequence, first-run checklist, open-beta test matrix, guardrails, and launch gate.
- Excluded the local review recording and generated video frames from Git while retaining required source and public assets.
- Recorded the existing beta-preparation commit as `fdc1406` (`chore: prepare AgentProof for closed beta`); the current launch policy is now open beta with guardrails.
- Pushed branch `codex/production-repair` to `origin`.
- Final verification: typecheck passed; 5 tests passed; production build passed; ESLint passed with one existing non-blocking custom-font warning; `git diff --cached --check` passed.
- Remaining work is external to this repository: Amplify HTTPS deployment, Cognito production callbacks, real agent endpoint testing, monitoring/rollback review, and Dodo webhook configuration.

### Review

- `npm run typecheck` passed.
- `npm test -- --run` passed: 4 files, 8 tests, including the rolling open-beta run-window test.
- `npm run build` passed and emitted the protected `/profile` route.
- `npx eslint .` passed with one existing non-blocking `@next/next/no-page-custom-font` warning in `src/app/layout.tsx`.
- `git diff --check` passed.
- Local smoke checks: `/` and `/auth/sign-in` return 200; unauthenticated `/profile` redirects to sign-in; malformed/invalid auth input returns JSON 400/422 responses.
- Browser verification at the requested mobile width found and fixed landing-page horizontal overflow; the local server is running at `http://localhost:3002`.
- Real Cognito sign-in remains blocked until the expired `agentproof-dev` AWS SSO session is refreshed.

### Open-Beta Guardrails Review

- Public cohort signup remains enabled through Cognito self-signup; email confirmation is still required before sign-in.
- `AGENTPROOF_BETA_MODE=true` now enforces configurable limits of five agents per account and ten runs per agent in a rolling 24-hour window by default.
- Limit failures return actionable `429` responses without exposing AWS, queue, or provider details.
- The README, `.env.example`, checklist, and engineering lessons now use the open-beta policy consistently.
