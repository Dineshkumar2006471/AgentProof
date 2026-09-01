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
- [x] Review CloudWatch queue, worker, OpenAI, and Cognito alarms before cohort onboarding; configured alarms are currently `OK`.

## Public Beta Deployment Execution

- [x] Add GitHub Actions checks for typecheck, tests, lint, build, infrastructure synthesis, and diff whitespace.
- [x] Configure Amplify build instructions to use Node.js 22.
- [x] Formalize `OPENAI_SECRET_ARN` for production SSR secret retrieval.
- [x] Reauthenticate the configured AWS CLI profile and verify the target account `899640267626` in `ap-south-1`.
- [x] Confirm the `AgentProof-production` CDK stack is `UPDATE_COMPLETE` and confirm the production OpenAI secret has an `AWSCURRENT` version.
- [x] Merge the release branch into `main`; GitHub Actions passed on merge commit `a099924`.
- [ ] Protect `main` with the GitHub Actions `Quality and build` check; branch-protection configuration still requires repository settings access.
- [ ] Connect `main` to Amplify Hosting and configure production environment variables.
- [ ] Obtain and verify the generated Amplify HTTPS URL while the local server is stopped.
- [ ] Complete production auth, verification, report, quota, monitoring, and rollback smoke tests.
- [ ] Add the custom domain only after the Amplify URL passes the full acceptance gate.

## Account Identity Privacy

- [x] Replace the authenticated sidebar workspace label with the signed-in user’s full name and email.
- [x] Read verified Cognito name and email claims for the authenticated workspace identity.
- [x] Remove Cognito subject/user IDs from the profile UI and keep only user-facing account details.
- [x] Uppercase profile page headings and action labels to match the internal platform hierarchy.
- [x] Remove the profile page identity heading and hide the email line below the sidebar name.
- [ ] Verify the identity display with a newly created account and an existing account that has no name attribute.

### Account Identity Privacy Review

- The shared sidebar now resolves the signed-in display name and email from `/api/auth/me`; it no longer shows the AgentProof workspace name as the account identity.
- The profile surface no longer renders the Cognito subject or labels it as username/email.
- `npm run typecheck`, `npm test -- --run`, `npm run build`, `npx eslint .`, and `git diff --check` pass after the identity changes.
- Authenticated visual verification still requires a valid Cognito session; the unauthenticated profile redirect remains verified locally.

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

### Public Beta Deployment Review

- Repository-controlled CI/CD work is implemented; no AWS credentials are stored in GitHub Actions.
- GitHub PRs #1 and #2 are merged; `main` has a successful `Quality and build` run on merge commit `a099924`.
- Production AWS stack, OpenAI secret metadata, worker, queue, and configured CloudWatch alarms are confirmed healthy in `ap-south-1`.
- Amplify remains unconnected because `aws amplify list-apps` returns no apps; repository connection and environment configuration remain the next external deployment step.
- The local server on port `3002` is not a production host and must not be treated as the always-on beta URL.

## Local Cognito Authentication Repair

- [x] Reproduce the localhost response with a deliberately invalid account: Cognito returns structured `401 Authentication failed.`
- [x] Verify the local `agentproof-dev` SSO profile and development pool configuration.
- [x] Remove the unnecessary AWS SDK credential dependency from Cognito auth API calls.
- [x] Preserve HTTP-only session cookies, JWT verification, refresh, sign-out, and existing route behavior.
- [x] Confirm localhost auth reaches Cognito while the AWS SSO cache is expired.

### Review

- Root cause: the local auth transport used the AWS SDK, so it depended on the laptop's expiring SSO cache. A Cognito `401` remains an account, password, pool, or confirmation problem and is intentionally not converted into a success or infrastructure error.
- Local development uses the development Cognito pool. A user created only through the deployed production URL must be created and confirmed separately in the local development pool, or the local environment must be deliberately configured as a complete production-like environment.
- Typecheck, Vitest, ESLint, `git diff --check`, and a live localhost invalid-login request passed after the repair.

## Pricing And Account Menu Correction

- [x] Reduce shared beta quotas to 5 free tests per run, 25 Builder tests per month, and 100 Agency tests per month.
- [x] Replace the generic profile-menu workspace label with the signed-in user's verified full name.
- [x] Add regression coverage for the conservative quota definitions.

## Fresh Beta Deployment

- [x] Refresh the `agentproof-dev` AWS SSO session and fast-forward the feature branch with `origin/main`.
- [x] Discover that Dodo variables were app-level only and that Amplify rejects the reserved `AWS_REGION` prefix.
- [x] Add runtime region fallback and prepare branch-level Dodo configuration synchronization.
- [x] Run the release gate, commit, push, merge PR #8, and monitor Amplify job 9.

## Live Amplify Deployment Audit

- [x] Confirm the deployed app, `main` branch, and latest build status.
- [x] Compare Amplify environment variables with the production CDK outputs.
- [x] Attach the production SSR compute role and correct production resource identifiers.
- [x] Rebuild the `main` branch and verify public pages and authentication behavior.
- [x] Run post-deploy checks for Cognito, DynamoDB, SQS, OpenAI secret access, reports, and local URL leakage.

### Live Audit Notes

- Initial live inspection found the Amplify build succeeded, but the app-level environment variables omitted `AWS_REGION` and `NEXT_PUBLIC_APP_URL`.
- The deployed app was pointed at the development Cognito pool/client and development verification queue despite using production DynamoDB/S3 resources.
- Amplify had no `computeRoleArn`, so the deployed SSR runtime was not attached to the CDK-managed production role.
- The first environment correction was stored at the Amplify app level, but the SSR runtime still did not receive it; the `main` branch variables were then set explicitly.
- AWS Amplify requires selected variables to be written into `.env.production` during the Next.js build for SSR server routes to read them at request time.
- Amplify jobs 3 and 4 passed; job 4 deployed merge commit `744fddb` with the SSR build fix.
- Live sign-in with a deliberately invalid account now returns `401 Authentication failed`, while malformed input returns `422 Required`; the previous `500 Internal server error` is resolved.
- Remaining launch work is real-user signup/confirmation and end-to-end verification against stable public agent endpoints.

## Domain, Pricing, Favicon, And Billing Implementation

- [x] Add shared beta pricing constants and update landing, pricing, and billing plan responses.
- [x] Add AgentProof favicon metadata and remove the missing icon request.
- [x] Uppercase non-hero landing content and add scoped hover/reduced-motion effects.
- [x] Implement gated Dodo test checkout and signed idempotent webhook handling.
- [x] Set and verify the custom canonical URL configuration where account access permits.
- [x] Run automated tests, build, lint, and live route checks.

### Review

- Typecheck passed.
- Vitest passed: 6 files and 12 tests.
- ESLint passed with one existing `@next/next/no-page-custom-font` warning in `src/app/layout.tsx`.
- Next production build passed and includes `/icon.png`, `/api/billing/checkout`, and `/api/webhooks/dodo`.
- Development and production CDK synthesis passed.
- `git diff --check` passed.
- Dodo test catalog contains Builder, Agency, and One Run products; Amplify stores their public product IDs and test-mode configuration on the `main` branch.
- Dodo API and webhook signing keys are present at branch scope without recording their values in the repository or logs.

## Checkout And Interaction Audit

- [x] Add a structured authenticated checkout review screen that matches the internal billing workspace.
- [x] Route landing-page paid plan CTAs through plan-specific checkout review screens.
- [x] Replace the landing sample-report placeholder link with a working, clearly labeled demo report route.
- [x] Replace the dormant pipeline certificate button with a working demo-report link.
- [x] Confirm Amplify has the test API key, webhook key, and approved test-user IDs without exposing their values.

### Checkout And Interaction Review

- Paid plan selection now preserves the selected plan through authentication and opens a structured order-review screen before hosted checkout.
- The screen remains intentionally gated until Dodo test credentials and approved test accounts are configured; it does not pretend that payment is live.
- Landing sample-report links now resolve to `/verify/demo`, while live reports continue to use the owner-generated public IDs.
- Final release-candidate audit passed in production mode: public routes, protected redirects, invalid-auth response, demo report, `/icon.png`, and `/favicon.ico` were verified locally.
- Amplify job 9 for merge commit `5848464` completed successfully after the final source change was merged to `main`.

## Fresh Beta Deployment Review

- GitHub Actions run 13 passed for PR #8.
- Production CDK synthesis, typecheck, Vitest, ESLint, Next production build, and `git diff --check` passed.
- `https://agent-proof.dev` and `https://www.agent-proof.dev` returned `200`; `/favicon.ico` and `/icon.png` returned `200`.
- Protected pages returned `307` without a session; `/api/auth/me` returned `401`; unsigned Dodo webhook requests returned `401`.
- The public landing response contained no `localhost` or `127.0.0.1` references.
- A real authenticated Dodo checkout and payment webhook still require the owner to sign in with an approved test user and complete the provider-side test transaction.

## Mobile Checkout And Favicon Polish

- [x] Reduce mobile checkout summary typography without changing the typography tokens.
- [x] Uppercase the checkout summary labels and values for a consistent workspace hierarchy.
- [x] Replace the dark favicon artwork with a brighter transparent AgentProof mark.
- [x] Run validation, commit through a pull request, and verify the deployed assets.

### Mobile Checkout And Favicon Review

- Checkout KPI labels, values, quotas, reports, and supporting details are uppercase; mobile values use compact fixed sizing and safe wrapping.
- The App Router icon and conventional favicon fallback use the brighter transparent AgentProof mark.
- Typecheck, 14 tests, ESLint, production build, and `git diff --check` passed locally.
- Final deployment verification will be recorded after the protected pull request and Amplify build complete.

## Mobile Workspace And Dodo Planning Pass

- [x] Remove the AP shortcut tile from the mobile workspace top bar.
- [x] Replace the drawer close X with a left-arrow control positioned on the drawer edge.
- [x] Reduce mobile checkout heading and KPI value sizes without changing typography tokens or colors.
- [x] Add the separate Dodo beta rollout and operator setup plan.
- [x] Rebuild Amplify after owner review of the local UI changes.

### Mobile Workspace And Dodo Planning Review

- Local `npm run typecheck`, `npm test -- --run` (12 tests), `npx eslint .`, `npm run build`, and `git diff --check` pass.
- Local route checks confirm pricing and demo-report pages load, while protected checkout still redirects unauthenticated users as expected.
- The local preview is available at `http://127.0.0.1:3002`; no commit, push, or redeploy was performed for this pass.

## Simple Password Policy

- [x] Align Cognito, application validation, and form feedback on an eight-character password minimum without complexity rules.
- [x] Replace generic signup errors with clear account and password guidance.
- [x] Deploy the production Cognito policy update without replacing the user pool or invalidating existing accounts.
- [ ] Confirm lowercase-only signup works on the live domain with an email inbox you control after Amplify deploys the application change.

### Simple Password Policy Review

- Production CloudFormation updated the existing `AgentProof-production` user pool in place at `2026-09-01T18:00:02Z`.
- Vitest passed 18 tests, typecheck passed, production CDK synthesis passed, and `git diff --check` passed.
- ESLint completed with the pre-existing custom-font warning in `src/app/layout.tsx` and no errors.

## Verification Console Refinement

- [x] Replace raw run and test identifiers in the primary verification-console hierarchy with readable operational labels.
- [x] Keep technical identifiers available only in the runner evidence stream.
- [x] Constrain desktop results and evidence columns to a shared console height with independent scrolling.
- [x] Verify the console at desktop and mobile breakpoints, then run the release checks.

### Verification Console Refinement Review

- The run header now shows version and test-suite context instead of a raw agent UUID.
- The primary result stream uses readable sequential labels while the runner-evidence surface retains the raw test IDs for technical investigation.
- Desktop results and evidence now share a 560px console height; both streams scroll independently and mobile retains a bounded results scroll area.
- Typecheck and 18 Vitest tests passed. ESLint completed without errors, the production build compiled successfully, and `git diff --check` passed.

## Report Evidence Refinement

- [x] Exclude passed assertions from public reported findings and reject placeholder judgment text.
- [x] Remove raw public report IDs and checksums from default report presentation.
- [x] Group private evidence into actionable findings and collapsed verified evidence.
- [x] Keep raw identifiers available through private export rather than the primary layout.
- [x] Verify report behavior and release checks before deployment.

### Report Evidence Refinement Review

- The worker now stores `Assertion satisfied.` for passing evidence and includes only non-passing judgments in new public report summaries.
- Public reports filter legacy empty or passing entries, omit opaque report IDs and hashes, and show only meaningful findings.
- Private reports lead with actionable findings; verified evidence is retained in a collapsed section, and the JSON export remains the full technical source of truth.
- Typecheck and 18 Vitest tests passed. ESLint completed without reported errors, the production build compiled successfully, and `git diff --check` passed.

## Endpoint Authentication Expansion

- [x] Add supported endpoint authentication modes: none, bearer token, API key, and Basic authentication.
- [x] Validate and store each credential safely in Secrets Manager without browser exposure.
- [x] Send the matching request header from the verification worker.
- [x] Update creation and dossier UI labels, tests, and release verification.

### Endpoint Authentication Expansion Review

- The creation form, API validation, DynamoDB agent metadata, Secrets Manager storage, and worker use one supported endpoint-authentication definition.
- API-key endpoints use `x-api-key` by default and support a validated custom header name. Basic credentials are serialized only into the endpoint secret and converted to a Basic authorization header only within the worker.
- Existing no-auth and bearer-token agents remain compatible.
- Typecheck and 21 Vitest tests passed. Targeted ESLint completed without reported errors, the production build completed, and `git diff --check` passed.
