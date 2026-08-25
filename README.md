# AgentProof

AgentProof turns an AI agent's operational claims into executable tests, runs them against the live agent endpoint, and produces a verification report that buyers can understand.

## Local Development

```powershell
npm install
npm run dev -- --hostname 127.0.0.1 -p 3000
```

Open `http://127.0.0.1:3000`.

## Verification

```powershell
npm run typecheck
npm run build
```

The application is designed for AWS deployment with Cognito, DynamoDB, S3, SQS, Lambda, and Amplify Hosting. OpenAI powers Level 1 contract and test generation. Secrets belong in local environment configuration or AWS-managed secret storage and must never be committed.
