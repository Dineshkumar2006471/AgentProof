# AgentProof — Production Health Audit

> **Audit timestamp**: 2026-09-07T15:30:00+05:30  
> **Auditor**: Automated code-level investigation  
> **Branch**: `main`  
> **Commit SHA**: `2d3d85aae07263bfe4bfe43bf03a9419d97cd9ca`  
> **Last commit**: `fix: keep signup available without Turnstile keys` (2026-09-03)  
> **Git status**: Clean (only untracked `cdk.out-*` directories)

---

## Phase 1 — Freeze and Inventory

### Runtime Environment

| Item | Value |
|---|---|
| Node.js | v25.6.0 |
| npm | 11.8.0 |
| Next.js | ^16.3.3 |
| AWS Region | `ap-south-1` (Mumbai) |
| CDK version | ^2.1138.0 |
| Vitest | ^4.1.11 |
| TypeScript | ^5.7.2 |
| OpenAI SDK | ^7.5.0 |

### Package Scripts

| Script | Command |
|---|---|
| `dev` | `next dev` |
| `build` | `next build` |
| `test` | `vitest run` |
| `lint` | `eslint .` |
| `typecheck` | `tsc --noEmit -p tsconfig.typecheck.json` |
| `infra:synth` | `cdk synth` |
| `infra:deploy` | `cdk deploy --all --require-approval broadening` |
| `infra:synth:production` | `cdk synth --context environment=production` |
| `infra:deploy:production` | `cdk deploy AgentProof-production --context environment=production --require-approval broadening` |
| `fixture:dev` | `tsx fixtures/agent-server/server.ts` |

### AWS Infrastructure (CDK Stack)

| Resource | Configuration |
|---|---|
| **DynamoDB Table** | `agentproof-{env}`, single-table (PK/SK), PAY_PER_REQUEST, 3 GSIs, TTL on `expiresAt`, PITR enabled |
| **S3 Bucket** | `agentproof-reports-{env}-{account}`, block all public, SSE-S3, versioned, 365-day lifecycle |
| **SQS Queue** | `agentproof-verification-{env}`, 10-min visibility timeout, 4-day retention, DLQ (3 max receives, 14-day retention) |
| **Lambda** | `agentproof-verification-worker-{env}`, Node 22, 5-min timeout, 1024 MB, batch size 1, source map enabled |
| **Cognito** | `agentproof-users-{env}`, email sign-in, self-signup, auto-verify email, 8-char minimum password, Hosted UI domain |
| **Secrets Manager** | `agentproof/openai/{env}` for OpenAI API key |
| **Amplify SSR Role** | `agentproof-amplify-ssr-{env}`, DynamoDB R/W, SQS SendMessage, SecretsManager read, S3 R/W, Cognito ListUsers |
| **CloudWatch** | Dashboard, worker error alarm, DLQ alarm, queue age alarm → SNS email |

### Environment Variables Expected by Production

#### Build-time (Amplify `.env.production` via `amplify.yml`)

```
NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST,
NEXT_PUBLIC_POSTHOG_PROJECT_URL, NEXT_PUBLIC_TURNSTILE_SITE_KEY,
NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED, AGENTPROOF_ENVIRONMENT,
AGENTPROOF_DAILY_RUN_LIMIT_PER_AGENT, AGENTPROOF_FOUNDER_USER_IDS,
AGENTPROOF_TURNSTILE_SECRET_KEY, AGENTPROOF_DYNAMODB_TABLE,
AGENTPROOF_REPORTS_BUCKET, AGENTPROOF_VERIFICATION_QUEUE_URL,
COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_DOMAIN,
NEXT_PUBLIC_COGNITO_USER_POOL_ID, NEXT_PUBLIC_COGNITO_CLIENT_ID,
OPENAI_SECRET_ARN, OPENAI_MODEL, DODO_PAYMENTS_API_KEY,
DODO_PAYMENTS_WEBHOOK_KEY, DODO_PAYMENTS_ENVIRONMENT,
DODO_CHECKOUT_ENABLED, DODO_BUILDER_PRODUCT_ID,
DODO_AGENCY_PRODUCT_ID, DODO_ONE_RUN_PRODUCT_ID
```

#### Lambda runtime (CDK-injected)

```
AGENTPROOF_ENVIRONMENT, AGENTPROOF_DYNAMODB_TABLE,
AGENTPROOF_REPORTS_BUCKET, AGENTPROOF_VERIFICATION_QUEUE_URL,
OPENAI_SECRET_ARN
```

> [!CAUTION]
> **Exposed OpenAI API key**: The `.env.local` file contains a plaintext `OPENAI_API_KEY` starting with `sk-proj-9VeqGe...`. This key should be **rotated immediately** in the OpenAI dashboard. While `.env.local` is in `.gitignore`, it is visible on this workstation.

### CI/CD

| Item | Details |
|---|---|
| CI workflow | `.github/workflows/ci.yml` — runs on push/PR to `main` |
| CI steps | checkout → Node 22 → `npm ci` → typecheck → test → lint → build → CDK synth (dev + prod) → whitespace check |
| Deployment | AWS Amplify SSR (triggered by push to `main`) |
| Amplify build | `nvm use 22` → `npm ci` → writes `.env.production` → `npm run build` |

---

## Phase 2 — Authentication Root-Cause Analysis: Email Signup

### Architecture Trace

```
Browser → POST /api/auth/sign-up → Zod validation → rate limit (DynamoDB) →
Turnstile → Cognito SignUp → DynamoDB policyAcceptance → 201 response →
confirmation code → POST /api/auth/confirm-sign-up → Cognito ConfirmSignUp →
POST /api/auth/sign-in → Cognito InitiateAuth → session cookies → /dashboard
```

### Finding: Email Signup SHOULD WORK (when env vars are set)

The signup code path is structurally sound:

1. **Validation**: `signUpSchema` validates name (2+), email, password (8+), `acceptedPolicies: true`, optional `captchaToken`.
2. **Rate limiting**: DynamoDB-based with conditional write; scope `signUp`, limit 5/hour per email.
3. **Turnstile**: `turnstileRequired()` returns `true` only when `AGENTPROOF_ENVIRONMENT === "production"` AND both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` AND `AGENTPROOF_TURNSTILE_SECRET_KEY` are set. In development or when Turnstile keys are missing, Turnstile is **bypassed**.
4. **Cognito**: Calls Cognito public API directly via `fetch()` (no SDK dependency in runtime — uses raw HTTP). Requires `COGNITO_CLIENT_ID` set.
5. **Policy acceptance**: Writes `PolicyAcceptance` record to DynamoDB.

### Root Cause Candidates for Email Signup Failure

| # | Candidate | Probability | How to Verify |
|---|---|---|---|
| 1 | **Missing `COGNITO_USER_POOL_ID` or `COGNITO_CLIENT_ID` in production Amplify env vars** | **HIGH** | Check Amplify console → Environment variables |
| 2 | **Missing `AGENTPROOF_DYNAMODB_TABLE` in production Amplify env vars** | **HIGH** | Check Amplify console → Environment variables |
| 3 | **`AWS_REGION` not available at SSR runtime** | **MEDIUM** | The `amplify.yml` does NOT include `AWS_REGION` in the grep! |
| 4 | **Turnstile misconfiguration in production** | **MEDIUM** | Check if `AGENTPROOF_TURNSTILE_SECRET_KEY` is set but site key is wrong |
| 5 | **Amplify SSR role lacks Cognito or DynamoDB permissions** | **LOW** | CDK grants DynamoDB R/W. Cognito SignUp uses public API, no IAM needed |
| 6 | **Rate limit DynamoDB write fails** | **LOW** | Possible if table doesn't exist |

> [!IMPORTANT]
> **Critical finding: `AWS_REGION` is NOT in the `amplify.yml` grep filter.** The `amplify.yml` only captures specific env vars to `.env.production`. `AWS_REGION` is **not listed**. The code falls back to `ap-south-1` via `awsRegion()`, which should be correct. However, the absence of `AWS_REGION` means the AWS SDK clients constructed at SSR runtime will rely on Amplify's execution environment default, which may differ from `ap-south-1`.

---

## Phase 3 — Google Auth Root-Cause Analysis

### Architecture Trace

```
Browser → POST /api/auth/google/start → validate intent → rate limit →
Turnstile (signup only) → generate state → build Cognito Hosted UI authorize URL →
set OAuth cookies → return { authorizeUrl } → browser redirect to Cognito →
Cognito → Google consent → Google → Cognito /oauth2/idpresponse →
Cognito → redirect to /api/auth/google/callback → validate state & code →
exchangeGoogleAuthorizationCode (POST to Cognito /oauth2/token) →
verify tokens → set session cookies → redirect to /dashboard
```

### Root Cause Candidates for Google Auth Failure

| # | Candidate | Probability | How to Verify |
|---|---|---|---|
| 1 | **`COGNITO_DOMAIN` not set in Amplify** | **HIGH** | `googleSignInEnabled()` checks `NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED === "true" && Boolean(COGNITO_DOMAIN && COGNITO_CLIENT_ID)`. If `COGNITO_DOMAIN` is empty, Google button is hidden or start returns 503. |
| 2 | **`NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED` not set to `"true"` in Amplify** | **HIGH** | Default is `"false"`. Must be explicitly set. |
| 3 | **Google identity provider not configured in Cognito** | **HIGH** | Requires `GOOGLE_OAUTH_SECRET_ARN` at CDK deploy time. If not set, no Google IDP exists. |
| 4 | **Callback URL mismatch** | **MEDIUM** | Cognito allows `{appUrl}/api/auth/google/callback`. Must match `NEXT_PUBLIC_APP_URL`. |
| 5 | **Hosted UI domain not deployed** | **MEDIUM** | CDK creates `agentproof-{env}-{account}` prefix. Needs CDK deploy with `GOOGLE_OAUTH_SECRET_ARN`. |

### Cookie Configuration

```typescript
// Google OAuth cookies
httpOnly: true
secure: process.env.NODE_ENV === "production"  // true in prod
sameSite: "lax"
path: "/"
maxAge: 600 (10 minutes)

// Session cookies
httpOnly: true
secure: process.env.NODE_ENV === "production"
sameSite: "lax"
path: "/"
maxAge: 3600 (access), 2592000 (refresh)
```

Cookie config looks correct for production Amplify with HTTPS.

---

## Phase 4 — Verification Pipeline Trace

### Architecture Trace

```
UI (POST /api/agents/{id}/run) → validate → count tests → check billing →
DynamoDB createVerificationRun (status=QUEUED) → SQS enqueueVerification →
return runId → UI polls GET /api/runs/{id} →

Lambda handler(SQSEvent) → processRun(runId) →
  getRun() → check status not COMPLETED/FAILED →
  claimVerificationRun() (QUEUED→RUNNING) →
  getAgent() → getContract() → listTests() →
  for each test:
    executeTest() → resolvePublicEndpoint() → DNS → TLS → POST →
    parse JSON → deterministicCheck() → judgeSemantics() (OpenAI) →
    saveTestRun() → saveEvidence() → updateRun(progress) →
  scoreFor() → saveScore() → saveVerificationStatus() →
  updateRun(COMPLETED)
```

### Root Cause: "No response recorded" Bug — **CONFIRMED IN CODE**

> [!CAUTION]
> **Lines 267-269 in `handler.ts`** — The `catch` block in the test execution loop replaces the execution result with empty strings on ANY error:
>
> ```typescript
> } catch (error) {
>   execution = { ok: false, response: "", rawResponse: "", toolCalls: [], actualState: {}, httpStatus: 0 };
>   judgment = { result: "fail", severity: "major", whyItFailed: error instanceof Error ? error.message : "Execution failed." };
> }
> ```
>
> This means:
> - **DNS resolution failure** → `response: ""`, `rawResponse: ""`
> - **TLS handshake failure** → `response: ""`, `rawResponse: ""`
> - **Connection timeout** → `response: ""`, `rawResponse: ""`
> - **HTTP error** → `response: ""`, `rawResponse: ""`
> - **JSON parse error** → (this is handled inline, not thrown)
> - **SSRF check failure** → `response: ""`, `rawResponse: ""`
> - **OpenAI judge error** → `response: ""`, `rawResponse: ""` ← **ERASES the valid agent response**
>
> The `testRun.agentResponse` is then stored as `""` (empty string).

### UI Display of Empty Responses

In `page.tsx` line 72:
```tsx
{result.agentResponse || "No response recorded."}
```

This uses JavaScript falsy check — empty string `""` is falsy, so it displays **"No response recorded."** even when the real problem was a DNS error, a timeout, or a judge failure.

### Root Cause Chain for "Every Test FAILED, No response recorded"

The most likely sequence:

1. **Lambda cannot reach the target agent endpoint** (DNS/network from Lambda VPC, or the endpoint is down)
2. The `executeTest()` catch block replaces everything with `response: ""`
3. `saveTestRun()` persists `agentResponse: ""`
4. UI displays "No response recorded."
5. The real error message is stored in `judgment.whyItFailed` but is **only** in Evidence, not displayed in the main test stream

**OR** alternatively:

1. **OpenAI judge call fails** (missing/invalid API key in Secrets Manager)
2. Error is thrown by `judgeSemantics()`
3. The same catch block erases the **valid** agent response
4. Same UI result

---

## Phase 5 — Target Agent Test

> **Pending**: Requires AWS SSO authentication to query Lambda logs and DynamoDB.

To be verified:
- Whether target agent endpoints are reachable from Lambda's network
- Whether the agents configured in the system have valid, live endpoints

---

## Phase 6 — Worker Error Masking Analysis

### Confirmed: Error masking is a design defect

The `handler.ts` catch block at line 267-270 **conflates** all these failure modes into identical output:

| Failure Type | `response` stored | `httpStatus` stored | Distinguishable? |
|---|---|---|---|
| DNS resolution failure | `""` | `0` | ❌ NO |
| TLS handshake failure | `""` | `0` | ❌ NO |
| Connection timeout | `""` | `0` | ❌ NO |
| HTTPS connection refused | `""` | `0` | ❌ NO |
| SSRF protection blocked | `""` | `0` | ❌ NO |
| OpenAI judge failure (after successful agent response) | `""` | `0` | ❌ NO — **erases valid agent response** |
| Agent returned HTTP 500 | actual response | `500` | ✅ YES (not caught) |
| Agent returned empty JSON | `""` (from payload.response) | `200` | ⚠️ Partially |

### Key Deficiency: No `executionStatus` field

The `TestRun` domain type has no field to record the execution outcome category. It only has:
- `agentResponse: string` — stores the parsed response
- `result: TestResult` — `"pass" | "fail" | "critical_fail"` — no distinction between failure modes
- `judgedBy: JudgmentMethod` — `"deterministic" | "tool_call" | "llm"`

**Missing fields**:
- `executionStatus` (success/timeout/dns_error/tls_error/http_error/parse_error/evaluator_error)
- `httpStatus` (stored in execution result but NOT persisted to DynamoDB)
- `latencyMs`
- `errorCode`
- `errorMessage`

---

## Phase 7 — OpenAI Judge Analysis

### Architecture

```
Lambda → getOpenAI() → resolveApiKey() →
  if OPENAI_API_KEY env → use directly ← NOT SET in Lambda env
  if OPENAI_SECRET_ARN env → SecretsManager GetSecretValue →
    try JSON.parse → look for OPENAI_API_KEY key
    catch → use raw string as key
  → OpenAI client → chat.completions.parse() →
    zodResponseFormat(judgmentSchema) → parse result
```

### Risk Areas

1. **Secret format**: The Lambda gets `OPENAI_SECRET_ARN` from CDK. The secret was created as `CfnSecret` (which creates an **empty** secret). The value must be **manually seeded** — if not done, OpenAI calls will fail with "OpenAI secret is empty."
2. **Judge failure erases agent response**: If `judgeSemantics()` throws, the catch block at line 267 replaces `execution` (which had the valid agent response) with `response: ""`.
3. **Model**: `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Lambda doesn't receive this env var — it's not in the CDK environment block. The Lambda would use whatever `env.ts` defaults to. But wait — **the Lambda doesn't use `env.ts`**. It imports from `../../src/lib/openai/semantic-judge` which imports from `../../src/lib/openai/client` which imports from `../../src/lib/env`. The Lambda WILL parse `env.ts` at cold start.

> [!WARNING]
> The Lambda receives `OPENAI_SECRET_ARN` but NOT `OPENAI_MODEL`, `OPENAI_API_KEY`, or `AWS_REGION` directly. It inherits the Lambda execution role's region. The `env.ts` Zod schema makes most fields optional, so it won't crash at parse time, but `OPENAI_MODEL` will default to `"gpt-4.1-mini"`. If the OpenAI account doesn't have access to this model, all judge calls will fail.

---

## Phase 8 — SQS Analysis

### Configuration

- Queue URL env: `AGENTPROOF_VERIFICATION_QUEUE_URL`
- Visibility timeout: 10 minutes
- Lambda timeout: 5 minutes (safe — visibility > processing)
- Batch size: 1
- DLQ: max 3 receives before going to DLQ
- Amplify role: `grantSendMessages` ✅
- Lambda role: `grantConsumeMessages` ✅

### Verification Needed (requires AWS access)

- [ ] Queue exists in production
- [ ] Lambda event source mapping is active
- [ ] DLQ message count
- [ ] Messages are being consumed

---

## Phase 9 — DynamoDB Analysis

### Data Model

All records stored in single table with PK/SK pattern:

| Entity | PK | SK |
|---|---|---|
| Agent | `AGENT#{id}` | `META` |
| Contract | `AGENT#{agentId}` | `CONTRACT#{version}` |
| Test | `AGENT#{agentId}` | `TEST#{testId}` |
| VerificationRun | `RUN#{id}` | `META` |
| TestRun | `RUN#{runId}` | `TESTRUN#{testRunId}` |
| Evidence | `RUN#{runId}` | `EVIDENCE#{evidenceId}` |
| Score | `RUN#{runId}` | `SCORE` |
| Status | `RUN#{runId}` | `STATUS` |
| PolicyAcceptance | `USER#{ownerId}` | `POLICY#TERMS` |
| BillingAccount | `USER#{ownerId}` | `BILLING#ACCOUNT` |
| RateLimit | `RATE#{scope}#{subject}` | `WINDOW#{start}` |

### Verification Needed (requires AWS access)

- [ ] Table exists in production
- [ ] Recent runs exist
- [ ] TestRun records have `agentResponse` values
- [ ] Evidence records exist for completed runs

---

## Phase 10 — UI Polling Analysis

### Run Page (`/agents/[id]/run?run={runId}`)

The UI polls `GET /api/runs/{runId}` every 2 seconds while status is QUEUED or RUNNING.

The API returns:
- `run` with computed `completed` and `percent`
- `testResults` (filtered by `entityType === "TestRun"`)
- `status` (filtered by `entityType === "VerificationStatus"`)

### UI Bug: No Failure Differentiation

```tsx
// Line 72 — Test result display
{result.agentResponse || "No response recorded."}
```

This single line treats ALL of these identically:
- Agent returned empty string → "No response recorded." (MISLEADING)
- Agent was unreachable (DNS/timeout) → "No response recorded." (WRONG)
- Agent returned HTTP 500 → "No response recorded." (WRONG, if catch block triggered)
- OpenAI judge failed → "No response recorded." (WRONG — erased valid response)
- Worker crashed before writing → "No response recorded." (CORRECT)

### Evidence Panel

```tsx
// Line 72 — Evidence pane
{item.agentResponse || "No response"}
```

Same problem — all failures look identical.

---

## Summary of Root Causes

### Issue 1: Email Signup Failures

| Root Cause | Component | Severity |
|---|---|---|
| `AWS_REGION` not in Amplify build grep → may use wrong region for DynamoDB/Cognito calls | `amplify.yml` | 🔴 High |
| Missing env vars in production Amplify | Amplify config | 🔴 High (needs verification) |
| Turnstile misconfiguration | Turnstile | 🟡 Medium |

### Issue 2: Google Signup/Sign-In Failures

| Root Cause | Component | Severity |
|---|---|---|
| `COGNITO_DOMAIN` likely not set in Amplify | Amplify config | 🔴 High |
| `NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED` likely `"false"` | Amplify config | 🔴 High |
| Google IDP may not be configured in Cognito (requires CDK deploy with `GOOGLE_OAUTH_SECRET_ARN`) | CDK/Cognito | 🔴 High |

### Issue 3 & 4: All Tests FAILED + "No response recorded"

| Root Cause | Component | Severity |
|---|---|---|
| **Error-masking catch block in `handler.ts:267-270`** — erases execution data on any error | Lambda worker | 🔴 Critical |
| **Judge failure erases valid agent response** — if OpenAI fails AFTER agent responds, response is lost | Lambda worker | 🔴 Critical |
| **OpenAI secret may be empty** — CfnSecret creates empty, needs manual seed | Secrets Manager | 🔴 High |
| **`OPENAI_MODEL` not passed to Lambda** — defaults to `gpt-4.1-mini`, may not exist | CDK/Lambda | 🟡 Medium |
| **No `executionStatus` field** — no way to distinguish failure types in stored data or UI | Domain model | 🔴 Critical |
| **UI uses falsy check** `agentResponse || "No response recorded."` — empty string shows wrong message | Frontend | 🟡 Medium |
| **`httpStatus` computed but not persisted** — lost after execution | Lambda worker | 🟡 Medium |

### Issue 5: Security

| Finding | Severity |
|---|---|
| **OpenAI API key exposed in `.env.local`** | 🔴 Critical — rotate immediately |

---

## Next Steps (Pending AWS SSO Authentication)

Once you authenticate the AWS SSO session, I will:

1. **Query Amplify console** for production environment variables
2. **Check Cognito User Pool** for Google identity provider configuration
3. **Check Secrets Manager** for OpenAI secret content (exists? non-empty?)
4. **Check SQS** for queue status, DLQ messages
5. **Check DynamoDB** for recent verification runs and their data
6. **Check Lambda CloudWatch logs** for recent errors
7. **Check Lambda event source mapping** status

**Please complete the AWS SSO authentication in your browser**, then let me know so I can proceed with the AWS-side investigation.
