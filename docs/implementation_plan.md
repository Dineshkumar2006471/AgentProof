# AgentProof Production Health Audit & Remediation Plan

This plan addresses all 17 of the reported production failures, identifying their root causes and proposing concrete fixes.

## 1. Authentication Failures (Email & Google)

**Root Causes:**
1. **Email Signup / API Failures:** The AWS Amplify production environment is missing several required environment variables, and the repository's `amplify.yml` build specification fails to capture `AWS_REGION`. This causes Next.js server-side requests (to DynamoDB and Cognito) to fail or default incorrectly.
2. **Google Sign-In Missing:** The Amplify environment is completely missing `NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED` and `COGNITO_DOMAIN`. Without these, the Google sign-in button won't appear, and the API endpoints will return errors.
3. **Turnstile Missing:** Turnstile keys are missing in the production Amplify environment.

**Proposed Fixes:**
- **Code:** Update `amplify.yml` in the repository to include `AWS_REGION` in the `grep` filter that writes to `.env.production`.
- **Infrastructure (Manual):** Add the missing environment variables to the Amplify Console for the production branch:
  - `NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED="true"`
  - `COGNITO_DOMAIN="agentproof-production-...auth.ap-south-1.amazoncognito.com"`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY="..."`
  - `AGENTPROOF_TURNSTILE_SECRET_KEY="..."`

## 2. Verification Pipeline "No Response Recorded"

**Root Causes:**
1. **Destructive Error Masking:** The `VerificationWorker` Lambda function contains a `catch` block (`workers/test-runner-worker/handler.ts:267-270`) that catches *all* execution errors (DNS failures, timeouts, JSON parsing errors, and even OpenAI judge failures) and replaces the result with an empty string (`response: ""`).
2. **OpenAI Secrets Empty:** The `agentproof/openai/production` secret in Secrets Manager was created via CDK (`CfnSecret`), meaning it was created **empty**. When the Lambda tries to use the OpenAI judge, it fails to read the key, throws an error, and triggers the destructive catch block above (which erases the valid agent response).
3. **Data Model Gap:** The `TestRun` domain model lacks a field to record *why* a test failed at the execution layer (e.g., `executionStatus` like `timeout`, `dns_error`, `http_error`).
4. **UI Falsy Check:** The UI (`src/app/agents/[id]/run/page.tsx`) uses `result.agentResponse || "No response recorded."`, which treats legitimate empty responses, network errors, and judge failures exactly the same.

**Proposed Fixes:**
- **Code (Worker):** Rewrite the `executeTest` and `processRun` logic in `handler.ts` to properly catch, classify, and persist execution errors without erasing the agent's actual response.
- **Code (Domain):** Add an `executionStatus` or `errorCategory` field to `TestRun` and `Evidence` in `src/lib/domain.ts`.
- **Code (UI):** Update `page.tsx` to read the new execution status and display accurate error messages (e.g., "Connection Timeout" vs. "Agent returned 500").
- **Infrastructure (Manual):** You must manually seed the OpenAI API key into the `agentproof/openai/production` secret in AWS Secrets Manager.

## 3. Security Finding (Critical)

**Root Cause:**
Your local `.env.local` file contains a plaintext `OPENAI_API_KEY` (`sk-proj-9VeqGe...`). This key is currently exposed on this workstation.

**Proposed Fix:**
- You must immediately revoke this key in the OpenAI dashboard and generate a new one.

---

## User Review Required

Does this assessment and remediation plan look correct to you? If you approve, I will proceed with:
1. Updating `amplify.yml`
2. Updating the domain model (`src/lib/domain.ts`)
3. Fixing the destructive error masking in the worker (`handler.ts`)
4. Updating the UI to display accurate error states (`page.tsx`)
