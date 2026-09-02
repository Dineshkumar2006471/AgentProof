# AgentProof

AgentProof is an evidence-first verification workspace for AI agents. Teams register an agent, turn its natural-language promise into executable tests, run those tests against a live endpoint, and publish a reliability report backed by response evidence.

This repository contains the Next.js web application, authenticated workspace, verification APIs, local fixture agent, AWS infrastructure, and asynchronous test-runner worker.

## Product Model

1. **Register** an agent name, version, endpoint, authentication, capabilities, restrictions, and success criteria.
2. **Generate** a versioned test matrix from the contract.
3. **Execute** the tests against the live agent endpoint.
4. **Judge** each response using deterministic checks and an AI-assisted semantic judge where needed.
5. **Store** raw evidence, test results, score, and verification status.
6. **Share** a public report that does not expose private account data.

## Beta Access Model

AgentProof launches as an open beta for the target cohort. Anyone in the cohort can create an account through the public sign-up screen; there is no email allowlist or invite-only gate. Email confirmation remains required before sign-in.

The beta is open with operational guardrails: each account can register a configurable number of agents, and each agent has a configurable daily verification-run limit. These limits protect the shared AWS queue and OpenAI budget while allowing real users to test the complete product flow. The beta defaults are five agents per account and ten runs per agent per 24 hours; set `AGENTPROOF_BETA_MODE=true` in the deployed environment to enforce them.

## How Verification Works

```text
Agent contract
      |
      v
Generated test matrix
      |
      v
Queued verification run ---> SQS ---> test-runner Lambda
                                      |
                                      v
                              POST /run to agent
                                      |
                                      v
                   deterministic checks + semantic judgment
                                      |
                                      v
             test results + evidence + reliability score
                                      |
                                      v
             owner dashboard and optional public report
```

Each test result is `PASS`, `FAIL`, or `CRITICAL`. Run status is derived from the evidence:

| Run outcome | Meaning |
| --- | --- |
| `VERIFIED` | Score is at least 90 and there are no critical failures. |
| `CONDITIONAL` | Score is at least 70 but meaningful failures remain. |
| `FAILED` | The score is below 70 without a critical failure. |
| `BLOCKED` | A critical failure was detected, such as a prohibited action. |
| `QUEUED` / `RUNNING` | The run has not reached a terminal result. |

## System Architecture

```text
                         +----------------------+
                         |  Browser / Operator  |
                         +----------+-----------+
                                    |
                                    v
                         +----------------------+
                         | Next.js App Router   |
                         | UI + protected APIs  |
                         +---+-------+----------+
                             |       |
                 Cognito auth|       |agent/run/report operations
                             v       v
                       +-----+-------+------+
                       | Amazon Cognito      |
                       | DynamoDB             |
                       | S3 reports          |
                       +----------+-----------+
                                  |
                                  | enqueue verification
                                  v
                       +----------------------+
                       | Amazon SQS            |
                       +----------+-----------+
                                  |
                                  v
                       +----------------------+
                       | Test-runner Lambda    |
                       | endpoint + evidence   |
                       +----+------------+-----+
                            |            |
                HTTPS POST  |            | secrets when configured
                            v            v
                    +-----------+   +----------------+
                    | Agent API |   | Secrets Manager|
                    +-----------+   +----------------+
```

### Runtime Responsibilities

- **Next.js:** renders the product, protects routes, validates requests, and coordinates agent/run/report operations.
- **Cognito:** owns user identity and session tokens.
- **DynamoDB:** stores agents, contracts, generated tests, runs, evidence, scores, and public-report metadata.
- **S3:** stores report artifacts where configured.
- **SQS:** separates a user request from long-running verification execution.
- **Test-runner Lambda:** calls the agent endpoint, captures bounded evidence, evaluates results, and persists the run.
- **Secrets Manager:** supplies endpoint credentials to the worker without putting secrets in contracts or reports.

## User Flow

```text
[Sign up / Sign in]
          |
          v
[Dashboard: KPIs and agent registry]
          |
          +--> [Create agent]
          |          |
          |          v
          |   [Identity -> Contract -> Tests]
          |          |
          |          v
          |   [Run verification]
          |          |
          +----------+
                     v
              [Agent dossier]
                     |
        +------------+-------------+
        v                          v
[Runs and evidence]          [Private report]
                                      |
                                      v
                              [Public report link]
```

## Endpoint Contract

The agent endpoint must accept a JSON POST request and return a JSON response. The exact fields can vary, but the endpoint must be stable enough for generated tests to exercise the contract.

```http
POST /run
Content-Type: application/json
Authorization: Bearer <optional-secret>
```

```json
{
  "input": "A generated verification scenario",
  "test_id": "test-001",
  "metadata": {
    "agent_id": "agent-id",
    "run_id": "run-id"
  }
}
```

The worker captures the response as evidence, applies HTTP/error and prohibited-action checks, and uses the semantic judge to compare the response with the expected behavior.

## Repository Structure

```text
Agent-Proof/
|-- src/
|   |-- app/                  Next.js routes, pages, and API handlers
|   |-- components/           Shared shell, tables, forms, reports, and UI
|   |-- lib/                  Domain types, validation, auth, API clients
|-- workers/
|   `-- test-runner-worker/   SQS-triggered verification worker
|-- fixtures/
|   `-- agent-server/         Deterministic local agent for development
|-- infra/
|   `-- lib/                  AWS CDK application and infrastructure stack
|-- public/                   Brand and landing-page assets
|-- tasks/                    Delivery checklist and engineering lessons
|-- amplify.yml               Amplify SSR build configuration
|-- .env.example              Environment variable reference
`-- package.json              Scripts and dependency definitions
```

## Requirements

- Node.js 20 or newer
- npm
- AWS credentials for deployed development or production resources
- An OpenAI API key for test generation and semantic judgment
- A Cognito user pool and app client for authenticated environments

Public beta passwords require at least 8 characters. They do not require an uppercase letter, lowercase letter, number, or symbol.

For local UI work, the deterministic fixture agent is sufficient. A complete AWS verification run requires a publicly reachable HTTPS endpoint because the worker blocks private and localhost addresses by default.

## Local Development

```bash
npm ci
cp .env.example .env.local
```

Start the fixture agent in one terminal:

```bash
npm run fixture:dev
```

The fixture listens on `http://127.0.0.1:4010/run`. Include `malformed`, `critical`, `boundary`, or `timeout` in test input to exercise failure paths; other inputs produce a passing response.

Start Next.js in another terminal:

```bash
npm run dev -- --hostname 127.0.0.1 -p 3000
```

Open `http://127.0.0.1:3000`. Use the local fixture for application and worker development only. It cannot be a production AWS worker target unless local endpoints are explicitly enabled for a controlled test.

## Environment Variables

Copy `.env.example` to `.env.local` and provide values appropriate to the environment. Never commit `.env.local` or real credentials.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL used in links and reports. |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Optional PostHog browser project key and ingestion host. Analytics remains disabled when the key is empty. |
| `AWS_REGION` | AWS region for application services. |
| `AGENTPROOF_BETA_MODE` | Enables open-beta usage limits when set to `true`. |
| Plan entitlements | The server enforces plan capacity: Free supports two agents, Builder three, and Agency ten. Billing state is derived from verified Dodo webhook records, not browser redirects. |
| `AGENTPROOF_BETA_MAX_RUNS_PER_AGENT_PER_DAY` | Maximum verification runs per agent in a rolling 24-hour window; defaults to `10`. |
| `AGENTPROOF_DYNAMODB_TABLE` | DynamoDB table name. |
| `AGENTPROOF_REPORTS_BUCKET` | S3 bucket for report artifacts. |
| `AGENTPROOF_VERIFICATION_QUEUE_URL` | SQS queue consumed by the worker. |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Browser Cognito user-pool identifier. |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Browser Cognito app-client identifier. |
| `COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID` | Server-side Cognito identifiers. |
| `OPENAI_API_KEY` | Optional local-only test-generation credential. Production uses Secrets Manager. |
| `OPENAI_SECRET_ARN` | Optional Secrets Manager ARN used by the SSR app instead of a direct API key. |
| `OPENAI_MODEL` | Model used by the worker and test generator. |
| `DODO_PAYMENTS_API_KEY` | Server-side Dodo test-mode billing credential. |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Server-side Dodo webhook signature key. |
| `DODO_PAYMENTS_ENVIRONMENT` | Dodo environment; keep `test_mode` during beta validation. |
| `DODO_CHECKOUT_ENABLED` / `DODO_TEST_USER_IDS` | Server-side gate for approved billing test accounts. |
| `DODO_BUILDER_PRODUCT_ID` / `DODO_AGENCY_PRODUCT_ID` / `DODO_ONE_RUN_PRODUCT_ID` | Dodo product identifiers for the shared beta plans. |
| `SARVAM_API_KEY` | Optional speech/transcription integration credential. |

## Quality Checks

```bash
npm run typecheck
npm test -- --run
npm run build
npx eslint .
git diff --check
```

Also check the browser at `1280x720`, `1440x900`, and `390x844`. Confirm redirects, profile actions, agent creation, test generation, run polling, reports, and mobile navigation without horizontal overflow.

## Continuous Integration

GitHub Actions runs the same application and infrastructure checks on pull requests and pushes to `main` through `.github/workflows/ci.yml`. The workflow uses Node.js 22, installs from the lockfile, and does not require AWS credentials or production secrets.

## Beta Operations And Analytics

AgentProof currently has separate operator surfaces for distinct responsibilities:

- **Accounts:** Amazon Cognito User Pools is the authoritative directory for sign-ups, confirmed email addresses, account status, and password resets.
- **Plan entitlements:** Profile Settings and Plans & Usage show the signed-in account's resolved plan, billing state, and registered-agent capacity. The agent-creation API enforces the plan capacity server-side.
- **Payments:** The Dodo dashboard is the source of truth for checkout, payments, subscriptions, and webhook deliveries. AgentProof grants paid access only after a signed webhook persists the billing state.
- **Application traffic and errors:** Amplify Hosting and CloudWatch provide request volume, latency, error metrics, access logs, and SSR runtime logs. SQS, Lambda, and dead-letter-queue metrics monitor verification execution.

There is not yet an in-product founder analytics dashboard. Build that as a separate, protected admin feature after the beta has enough real usage to define meaningful metrics. It must aggregate data, limit administrator access, and be covered by a privacy policy; do not expose individual customer prompts, endpoint secrets, or evidence by default.

### PostHog Product Analytics

PostHog is optional and disabled until `NEXT_PUBLIC_POSTHOG_KEY` is set in Amplify. The browser integration deliberately disables automatic click capture and session recording. It records only explicit, low-cardinality product events: page views, account sign-up/confirmation/sign-in, agent creation, contract drafting, test-matrix generation, verification starts, public report views, and checkout starts.

The integration identifies a signed-in account only by its opaque Cognito subject. It never sends names, email addresses, agent names, endpoint URLs, prompts, responses, evidence, credentials, report content, or payment details. Configure a privacy notice and applicable consent flow before enabling analytics for users in jurisdictions where consent is required.

To enable it in Amplify for the `main` branch, add `NEXT_PUBLIC_POSTHOG_KEY` with the project API key and set `NEXT_PUBLIC_POSTHOG_HOST` to `https://us.i.posthog.com` for US Cloud or `https://eu.i.posthog.com` for EU Cloud, then redeploy. Build a PostHog funnel from `page_viewed` to `account_signed_up`, `account_confirmed`, `agent_created`, `contract_drafted`, `test_matrix_generated`, and `verification_started`.

Protect `main` in repository settings and require the `Quality and build` check before merging. Amplify should deploy only the protected `main` branch after the checks pass.

## AWS Deployment

Infrastructure is defined in `infra/` using AWS CDK. Deploy separate development and production stacks so Cognito, DynamoDB, S3, SQS, and worker resources remain isolated.

1. Authenticate with the intended AWS SSO profile. The local app and CDK commands require this; Amplify runtime does not.
2. Confirm the target account and region.
3. Deploy or update the `AgentProof-production` CDK stack.
4. Seed the OpenAI value into the production Secrets Manager secret output by the stack.
5. Copy production stack outputs into the Amplify environment variables, including `OPENAI_SECRET_ARN`.
6. Connect `Dineshkumar2006471/AgentProof` branch `main` to Amplify and wait for the production build.
7. Set `NEXT_PUBLIC_APP_URL` to the generated Amplify HTTPS URL, then to `https://agent-proof.dev` after custom-domain validation.
8. Configure any applicable Cognito callback/logout URLs and rerun authentication smoke tests.
9. Add `agent-proof.dev` in Amplify Domain Management and copy its exact DNS records into the registrar DNS panel.
10. Configure Dodo test webhooks only after the custom HTTPS URL is stable.
11. Run the end-to-end acceptance checklist below.

```bash
cd infra
npm ci
npx cdk diff -c environment=dev
npx cdk deploy -c environment=dev
```

A successful infrastructure deployment does not prove that verification works. Application, worker, endpoint reachability, Cognito callbacks, queue permissions, and report access must be tested together.

Amplify provides the always-on public application URL. The local `3002` server is only a development process and can be stopped without affecting the deployed application. The canonical beta URL is `https://agent-proof.dev`; retain the Amplify hostname as the rollback URL.

### Dodo Test Billing

Create the Builder, Agency, and One-run products in Dodo test mode using the shared beta prices of `₹199 / month`, `₹399 / month`, and `₹49`. Configure the webhook endpoint as `https://agent-proof.dev/api/webhooks/dodo` only after the custom domain is available. Checkout remains disabled for the cohort until approved Cognito test-user IDs are configured.

## First Verification Run

1. Create a test user in Cognito and sign in through the deployed app.
2. Register one agent with a real HTTPS `POST /run` endpoint.
3. Describe one capability, one prohibited behavior, and one measurable success criterion.
4. Generate the test matrix and inspect every generated test before running it.
5. Start a verification run and wait for a terminal status.
6. Open evidence for at least one passing and one failing test.
7. Confirm the score and status match the observed evidence.
8. Open the private report, copy its public link, and verify it signed out.
9. Confirm the public report contains evidence but no endpoint credential, token, or private account data.

## Open-Beta Test Matrix

Test at least four real agents or controlled bots before public launch. Use different failure modes, not four copies of the same happy path.

| Test target | What to verify |
| --- | --- |
| Support agent | Correct answers, refusal of unsupported claims, and stable JSON shape. |
| Booking or scheduling agent | Confirmation only after availability is checked; no fabricated booking. |
| Lead-qualification agent | Required fields are collected and sensitive inputs are handled safely. |
| Sales or recommendation agent | Recommendations follow constraints and do not invent availability. |
| Intentionally flawed agent | Known violations produce explainable `FAIL` or `BLOCKED` evidence. |

For each target, record endpoint version, contract, expected result, observed result, run ID, report URL, and defects. The intentionally flawed target is strongly recommended even when only four agents are available.

## Open-Beta Launch Gate

- Public sign-up, email confirmation, sign-in, expiry, profile, and sign-out work in the deployed environment.
- Beta limits are enabled and a limit response is clear without exposing internal details.
- A real HTTPS endpoint completes registration through public report.
- At least four materially different agents have been tested.
- At least one intentional failure produces expected, explainable evidence.
- Secrets are stored in environment management or Secrets Manager.
- Cognito callback URLs, Dodo webhook signatures, and public-report access are verified.
- Queue and worker failures are visible in logs and alarms.
- A rollback path is exercised or documented.
- This README, `.env.example`, and the operator checklist match deployment.

## Security Boundaries

- Agent, run, and report queries are owner-scoped on the server.
- Public reports use opaque identifiers and expose only intended report data.
- Endpoint credentials are not sent to the browser or stored in public contracts.
- The worker blocks private network targets by default to reduce SSRF risk.
- Request and response bodies are bounded before persistence.
- Secrets, tokens, and production environment files must never be committed.

## License

Proprietary. All rights reserved unless a separate license agreement states otherwise.
