# AgentProof Test Runner Worker

Level 1 verification runs execute asynchronously:

1. Next.js API creates a queued `VerificationRun`.
2. API sends a message to SQS.
3. Lambda worker consumes the message.
4. Worker calls the agent `POST /run` endpoint per test.
5. Worker writes `TestRun`, `Evidence`, `ReliabilityScore`, and `VerificationStatus`.

The worker implementation should be added after AWS credentials and queue/table names are configured.
