# AgentProof

AgentProof turns an AI agent's operational claims into executable tests, runs those tests against the live agent endpoint, and produces evidence-backed verification reports that buyers can understand.

## Contents

- [Product](#product)
- [Level 1 scope](#level-1-scope)
- [Architecture](#architecture)
- [Repository map](#repository-map)
- [Requirements](#requirements)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Quality checks](#quality-checks)
- [AWS deployment](#aws-deployment)
- [Security](#security)
- [License](#license)

## Product

AgentProof is a verification workspace for production AI agents. A builder supplies an agent endpoint and plain-language promises. AgentProof converts those promises into a versioned contract and test matrix, executes the tests, stores the evidence, and exposes a private builder report and a sanitized public report.

The product model is:

`Claim -> Contract -> Execution -> Evidence -> Verification status`

The interface is intentionally evidence-first: operational contracts, test IDs, timestamps, response traces, scores, and validity metadata are treated as first-class product objects.

## Level 1 scope

Level 1 is the reliable core build:

- Agent registration with name, version, endpoint, and connector contract.
- OpenAI-assisted contract drafting and executable test generation.
- Test execution against a configured `POST /run` agent endpoint.
- Durable run and evidence records, with failure reasons and status transitions.
- Builder dashboard, agent dossier, live execution console, private verification report, and sanitized public report.
- Verification score, validity metadata, checksum/report identity, and public report URL.
- AWS-native runtime boundaries and Dodo Payments integration points.

Regional-language expansion, cross-model judging, advanced monitoring, team administration, and enterprise controls remain extension points for later levels. Hindi, Telugu, Tamil, Kannada, and other required regional-language coverage belongs in the language test-matrix expansion, not in the initial Level 1 release unless explicitly promoted.

## Architecture

```mermaid
flowchart LR
    Browser[Next.js web app] --> Amplify[AWS Amplify Hosting]
    Amplify --> API[Next.js server routes]
    API --> Cognito[AWS Cognito]
    API --> DDB[(DynamoDB)]
    API --> S3[(S3 evidence objects)]
    API --> OpenAI[OpenAI API]
    API --> SQS[SQS verification queue]
    SQS --> Worker[Runner worker]
    Worker --> Agent[Customer agent POST /run]
    Worker --> DDB
    Worker --> S3
    Dodo[Dodo Payments] --> Webhook[/api/webhooks/dodo]
    Webhook --> DDB
```

### Runtime boundaries

- **Web and API:** Next.js App Router, hosted on AWS Amplify.
- **Identity:** Amazon Cognito. Authentication state is never implemented with client-only flags.
- **Persistence:** DynamoDB for agents, contracts, runs, evidence indexes, and billing state.
- **Evidence storage:** S3 for larger raw payloads and report artifacts.
- **Async execution:** SQS-backed worker boundary so verification runs do not depend on a browser connection.
- **Language model:** OpenAI only for the Level 1 build. No Gemini or Firebase dependency.
- **Payments:** Dodo Payments webhooks update server-side entitlement state after HTTPS hosting is available.

## Repository map

```text
src/app/                  App Router pages and API routes
src/components/           Shared product UI and report primitives
src/lib/                  Domain models, validation, AWS, OpenAI, auth, and reports
workers/                  Verification worker boundary
fixtures/                 Deterministic conformance agent for development acceptance
public/                   Product imagery and report assets
AgentProof-PRD.md         Product requirements and delivery priorities
AgentProof-design.md      Visual system, screen specs, and motion rules
amplify.yml               AWS Amplify build configuration
```

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- An AWS profile with least-privilege development permissions for the configured account
- An OpenAI project API key for model-backed contract/test generation

AWS and OpenAI credentials are intentionally not included in this repository. Production secrets belong in AWS-managed secret storage or the deployment environment.

## Local development

```powershell
npm install
npm run dev -- --hostname 127.0.0.1 -p 3000

# In a second terminal, for local worker acceptance
npm run fixture:dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

The primary product routes are `/dashboard`, `/agents/new`, `/agents/:id`, `/agents/:id/run`, `/agents/:id/report/:run`, `/verify/:publicId`, `/pricing`, and the Cognito-facing auth screens.

## Environment variables

Copy `.env.example` to `.env.local` for local development. Keep `.env.local` untracked.

| Variable | Purpose | Required for |
| --- | --- | --- |
| `OPENAI_API_KEY` | OpenAI project credential | contract/test generation |
| `OPENAI_MODEL` | Approved OpenAI model name | contract/test generation |
| `AWS_REGION` | AWS deployment region | AWS services |
| `DODO_API_KEY` | Dodo server credential | payment operations |
| `DODO_WEBHOOK_SECRET` | Dodo signature verification secret | payment webhooks |
| `DODO_*_PRICE_ID` | Product price identifiers | checkout |
| `AGENTPROOF_ENVIRONMENT` | Development or production secret namespace | server/worker |

Agent endpoint bearer tokens are accepted by the authenticated agent-creation route and written to AWS Secrets Manager. They are never returned to the browser or stored in report data.

Use AWS IAM Identity Center or an AWS profile for local AWS access. Do not paste credentials into source files, commit history, tickets, or chat.

## Quality checks

Run these before opening a pull request or deploying:

```powershell
npm run typecheck
npm test -- --run
npm run build

# Synthesize infrastructure without deploying
npm run infra:synth
npm run infra:synth:production
```

The UI should also be checked at desktop and mobile widths, with reduced motion enabled, across all primary routes.

## AWS deployment

The development and production CDK stacks are separate. Deploy them with the existing IAM Identity Center profile:

```powershell
$env:AWS_PROFILE = "agentproof-dev"
$env:AWS_REGION = "ap-south-1"
npm run infra:deploy
npm run infra:deploy:production
```

Seed each environment's OpenAI secret through AWS Secrets Manager. Do not put the value in CDK source or CloudFormation parameters.

The remaining hosting step is to connect this GitHub repository in Amplify Console, attach the environment-specific SSR role output, configure the environment variables from the CDK outputs, and deploy the `main` branch. No public Amplify URL exists until that connection and first deployment are complete. Create the Amplify HTTPS domain before registering the Dodo webhook:

`https://<amplify-domain>/api/webhooks/dodo`

Subscribe the webhook only to the payment and subscription events the application handles, and verify the Dodo signature before mutating billing state.

## Security

- Never commit `.env.local`, API keys, AWS access keys, webhook secrets, or customer evidence.
- Validate all endpoint inputs and webhook payloads at the server boundary.
- Treat customer agent responses as untrusted data.
- Redact internal URLs, raw metadata, and sensitive traces from public reports.
- Use least-privilege IAM roles and separate development and production resources.
- Keep asynchronous verification isolated from the request-serving process.

## License

AgentProof is released under the [MIT License](LICENSE).
