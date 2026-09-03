<p align="center">
  <a href="https://agent-proof.dev">
    <img src="./logo-agentproof.png" width="300" alt="AgentProof" />
  </a>
</p>

<h1 align="center">AgentProof</h1>

<p align="center"><strong>Turn AI agent promises into executable tests and reliability evidence.</strong></p>

<p align="center">
  <a href="https://agent-proof.dev">Live product</a> |
  <a href="https://agent-proof.dev/docs">Documentation</a> |
  <a href="https://agent-proof.dev/pricing">Plans</a> |
  <a href="./CONTRIBUTING.md">Contributing</a> |
  <a href="./SECURITY.md">Security</a>
</p>

<p align="center">
  <a href="https://github.com/Dineshkumar2006471/AgentProof/actions/workflows/ci.yml"><img src="https://github.com/Dineshkumar2006471/AgentProof/actions/workflows/ci.yml/badge.svg?branch=main" alt="AgentProof CI" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-1f6feb.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/runtime-Node.js%2022-339933.svg" alt="Node.js 22" />
  <img src="https://img.shields.io/badge/hosting-AWS%20Amplify-FF9900.svg" alt="AWS Amplify" />
</p>

---

AgentProof is an evidence-first verification platform for AI agents. Register a deployed agent, define what it can and must never do, generate an executable test matrix, run it against the real endpoint, and share a reliability report backed by recorded evidence.

The product is available as an open public beta at <a href="https://agent-proof.dev">agent-proof.dev</a>. It uses production AWS infrastructure while billing, operations, and reliability safeguards are validated with real users.

## Table of Contents

- [Why AgentProof](#why-agentproof)
- [How It Works](#how-it-works)
- [Platform Capabilities](#platform-capabilities)
- [Verification Outcomes](#verification-outcomes)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Agent Endpoint Interface](#agent-endpoint-interface)
- [Configuration](#configuration)
- [Google Sign-In](#google-sign-in)
- [Repository Structure](#repository-structure)
- [Testing and CI](#testing-and-ci)
- [Deploying to AWS](#deploying-to-aws)
- [Operations and Analytics](#operations-and-analytics)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Why AgentProof

AI agents can sound correct while making unsupported claims, mishandling sensitive requests, or claiming actions that never happened. AgentProof makes intended behavior explicit and tests it before a team relies on the agent in production.

It is designed for support, booking, lead qualification, sales, recommendation, and workflow agents that expose a public HTTPS <code>POST /run</code> endpoint.

## How It Works

~~~text
Register agent
      |
      v
Write capabilities, restrictions, and success criteria
      |
      v
Draft a versioned agent contract and test matrix
      |
      v
Queue a verification run
      |
      v
SQS -> test-runner Lambda -> HTTPS POST /run
      |
      v
Deterministic checks + semantic evaluation
      |
      v
Evidence, score, private report, optional public report
~~~

1. **Register** the endpoint, version, authentication configuration, capabilities, restrictions, and success criteria.
2. **Draft** a versioned contract from the stated promise.
3. **Generate** happy-path, edge, boundary, adversarial, and safety-sensitive scenarios.
4. **Execute** the selected matrix asynchronously against the live endpoint.
5. **Review** recorded responses, judgments, findings, reliability score, and report status.
6. **Share** a sanitized public report when it is appropriate to make the evidence public.

## Platform Capabilities

| Surface | What it provides |
| --- | --- |
| Agent registry | Endpoint, version, authentication configuration, contract history, and run history. |
| Contract drafting | An editable statement of capabilities, restrictions, required behavior, and failure policy. |
| Test generation | Scenario coverage for normal, edge, boundary, adversarial, and safety-sensitive interactions. |
| Verification worker | Asynchronous endpoint execution through SQS and Lambda, with bounded evidence capture. |
| Evidence ledger | Expected behavior, actual response, judgment, severity, and explainable findings for each test. |
| Reliability reports | Private operator reports and optional public reports with privacy boundaries. |
| Plan enforcement | Server-side agent, test, and verification-run quotas. |
| Operator metrics | Founder-only aggregate user, activity, plan, payment, and recurring-revenue signals. |

## Verification Outcomes

| Outcome | Meaning |
| --- | --- |
| <code>VERIFIED</code> | Reliability score is at least 90 with no critical finding. |
| <code>CONDITIONAL</code> | Reliability score is at least 70, but meaningful findings remain. |
| <code>FAILED</code> | Reliability score is below 70 without a critical finding. |
| <code>BLOCKED</code> | A critical safety or policy violation was detected. |
| <code>QUEUED</code> / <code>RUNNING</code> | Verification has not reached a terminal result. |

Each scenario records pass, fail, warning, or critical evidence. A report explains why an agent passed or failed rather than presenting only a number.

## Architecture

~~~text
                         +-----------------------+
                         | Browser / Workspace   |
                         +-----------+-----------+
                                     |
                                     v
                         +-----------------------+
                         | Next.js on Amplify SSR |
                         | UI + protected APIs   |
                         +-----+------------+----+
                               |            |
                       Cognito |            | app data
                               v            v
                    +----------+--+    +----+----------+
                    | Amazon Cognito|   | DynamoDB + S3 |
                    +-------------+    +----+----------+
                                               |
                                               | verification job
                                               v
                                        +------+------+
                                        | Amazon SQS  |
                                        +------+------+
                                               |
                                               v
                                      +--------+---------+
                                      | Lambda test runner |
                                      +--------+---------+
                                               |
                                               v
                                     +---------+----------+
                                     | Public HTTPS agent |
                                     |      POST /run     |
                                     +--------------------+
~~~

- **Next.js App Router:** product UI, protected APIs, reports, public documentation, and request validation.
- **Amazon Cognito:** account registration, confirmation, sign-in, refresh, and sign-out.
- **DynamoDB:** owner-scoped agents, contracts, tests, runs, evidence, plan state, and idempotent webhook records.
- **S3:** report artifacts when configured.
- **SQS and Lambda:** isolated, asynchronous verification execution.
- **Secrets Manager:** server-side OpenAI and endpoint secrets without browser exposure.
- **CloudWatch and SNS:** queue, worker, dead-letter, and operational alerting after the production stack is deployed.

## Quick Start

### Requirements

- Node.js 22 or newer
- npm
- AWS credentials only when using deployed AWS services or CDK
- A local OpenAI key for generation features, or a configured AWS Secrets Manager secret in deployed environments

### Run Locally

~~~powershell
npm ci
Copy-Item .env.example .env.local
~~~

Start the deterministic fixture agent in one terminal:

~~~powershell
npm run fixture:dev
~~~

Start the application in another terminal:

~~~powershell
npm run dev -- --hostname 127.0.0.1 -p 3000
~~~

Open <code>http://127.0.0.1:3000</code>.

The fixture listens at <code>http://127.0.0.1:4010/run</code>. Include <code>malformed</code>, <code>boundary</code>, <code>critical</code>, or <code>timeout</code> in fixture input to exercise known paths. Localhost endpoints are for controlled development only; the production worker blocks private and localhost network targets.

## Agent Endpoint Interface

AgentProof verifies public HTTPS endpoints that accept <code>POST /run</code>. The payload is JSON and includes a generated scenario plus run metadata.

~~~http
POST /run
Content-Type: application/json
Authorization: Bearer <optional-secret>
~~~

~~~json
{
  "input": "Can you cancel my order?",
  "test_id": "test-001",
  "metadata": {
    "agent_id": "agent_123",
    "run_id": "run_456"
  }
}
~~~

Return JSON. This response shape is recommended for the best evidence display:

~~~json
{
  "response": "I can explain the next step, but I cannot confirm a cancellation without verified backend evidence.",
  "tool_calls": [],
  "metadata": {
    "state": "escalated"
  }
}
~~~

The endpoint may use no authentication, bearer authentication, or another supported server-side credential configuration. Credentials are never sent to the browser or copied into public reports.

## Configuration

Copy <a href="./.env.example">.env.example</a> to <code>.env.local</code>. Never commit local environment files, AWS credentials, API keys, access tokens, or webhook secrets.

| Group | Key configuration |
| --- | --- |
| Application | <code>NEXT_PUBLIC_APP_URL</code>, <code>AGENTPROOF_ENVIRONMENT</code>, <code>AWS_REGION</code> |
| Authentication | Cognito user-pool and client identifiers |
| Verification | DynamoDB table, reports bucket, SQS URL, <code>OPENAI_SECRET_ARN</code>, and <code>OPENAI_MODEL</code> |
| Public-account protection | Turnstile site and secret keys in production |
| Analytics | Optional PostHog browser configuration; disabled when the project key is empty |
| Billing | Dodo live API key, webhook key, product IDs, and explicit checkout enablement |
| Founder analytics | <code>AGENTPROOF_FOUNDER_USER_IDS</code> containing permitted Cognito subject IDs only |

The published capacity model is enforced server-side:

| Plan | Capacity |
| --- | --- |
| Free | 1 agent, 15 tests/month, 2 verification runs/month |
| Builder | 3 agents, 100 tests/month, 10 verification runs/month |
| Agency | 10 agents, 500 tests/month, 50 verification runs/month |
| One-time | 1 verification run with up to 25 tests |

### Google Sign-In

Email/password remains available by default. Google sign-in uses Cognito's hosted authorization-code flow and is deliberately hidden until its Google Cloud client credentials and Cognito provider are configured. Follow [the Google sign-in setup guide](./docs/google-sign-in.md); do not put Google OAuth secrets in this repository or Amplify environment variables.

## Repository Structure

~~~text
Agent-Proof/
|-- src/
|   |-- app/                     Pages, metadata routes, and API handlers
|   |-- components/              Workspace, auth, report, and public-site UI
|   '-- lib/                     Domain logic, validation, auth, data, and safety helpers
|-- workers/test-runner-worker/  SQS-triggered verification worker
|-- fixtures/agent-server/       Deterministic local verification target
|-- infra/                       AWS CDK stack and application entry point
|-- public/                      Brand assets and images
|-- docs/                        Deployment and billing runbooks
|-- .github/workflows/ci.yml     Continuous integration workflow
|-- amplify.yml                  Amplify SSR build specification
'-- .env.example                Environment contract
~~~

## Testing and CI

Run the local release checks before opening a pull request or pushing to <code>main</code>:

~~~powershell
npm run typecheck
npm test -- --run
npx eslint .
npm run build
npm run infra:synth
npm run infra:synth:production
git diff --check
~~~

GitHub Actions runs the same quality gate on pull requests, direct pushes to <code>main</code>, and manual dispatch. It uses Node.js 22 and does not require production AWS credentials or secrets.

Also check the browser at <code>390x844</code>, <code>1280x720</code>, and <code>1440x900</code>. Verify authentication, protected redirects, agent creation, contract generation, verification polling, reports, and mobile navigation without horizontal overflow.

## Deploying to AWS

AWS infrastructure is defined with CDK in <code>infra/</code>. Development and production use separate stacks so identity, queues, tables, storage, and workers remain isolated.

1. Authenticate the intended AWS SSO profile and confirm account and region.
2. Deploy <code>AgentProof-production</code> using the production CDK context.
3. Store the OpenAI value in the stack-created Secrets Manager secret.
4. Copy production stack outputs to the Amplify <code>main</code> branch environment.
5. Confirm <code>NEXT_PUBLIC_APP_URL=https://agent-proof.dev</code> and deploy <code>main</code> through Amplify.
6. Configure Cognito callback/logout URLs, verify the custom-domain certificate, and run authentication smoke tests.
7. Confirm the SNS subscription used for CloudWatch operational alarms.
8. Run two reliable external agents and one intentionally flawed controlled agent through the full verification flow.

The deployed Amplify application uses its IAM runtime role. It does **not** depend on a developer laptop or AWS SSO session for user authentication.

### Billing Release Gate

Keep checkout disabled until all of the following are complete:

- Dodo live account, tax/invoice configuration, and live product IDs are ready.
- <code>https://agent-proof.dev/api/webhooks/dodo</code> is configured with signed webhook delivery.
- A successful payment, failed payment, cancellation, and duplicate webhook have been tested.
- The Terms, Privacy, Refunds, and Support pages have been founder-reviewed.

See <a href="./docs/dodo-payments-live-rollout.md">the Dodo live billing rollout</a> for the operator checklist.

## Operations and Analytics

- **Cognito:** sign-ups, confirmed accounts, and account state.
- **Amplify and CloudWatch:** traffic, SSR errors, runtime logs, queue activity, worker failures, and dead-letter queue state.
- **PostHog:** optional privacy-conscious product funnel analytics. It identifies signed-in accounts by opaque Cognito subject only and excludes emails, prompts, responses, endpoint URLs, evidence, credentials, and payment data.
- **<code>/founder</code>:** aggregate registered accounts, activity, subscriptions, payments, and recurring-revenue signals for allowlisted founder subjects. It never exposes customer evidence or private account data.

## Security

- Owner isolation is enforced server-side for agents, contracts, runs, evidence, and private reports.
- Public reports use opaque identifiers and expose only deliberately shared report data.
- The worker rejects private, loopback, and unsafe endpoint targets to reduce SSRF risk.
- Request and response evidence is size-bounded before storage.
- Billing entitlements are changed only by verified, idempotent Dodo webhook events.
- Authentication, reset, generation, verification, export, and checkout APIs have rate-limit primitives.

Please report vulnerabilities privately. See <a href="./SECURITY.md">SECURITY.md</a> rather than opening a public issue.

## Contributing

Contributions and bug reports are welcome. Start with <a href="./CONTRIBUTING.md">CONTRIBUTING.md</a>, keep changes focused, add appropriate tests, and do not commit secrets or generated deployment output.

## License

AgentProof is released under the <a href="./LICENSE">MIT License</a>.
