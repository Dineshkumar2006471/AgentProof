import fs from "node:fs";

const content = fs.readFileSync("workers/test-runner-worker/handler.ts", "utf-8");

let newContent = content.replace(
  'import type { Evidence, TestResult, TestRun, VerificationTest } from "../../src/lib/domain";',
  'import type { Evidence, TestResult, TestRun, VerificationTest, ExecutionStatus } from "../../src/lib/domain";'
);

newContent = newContent.replace(
  /async function executeTest[\s\S]*?(?=\nexport function deterministicCheck)/,
`type ExecutionResult = {
  ok: boolean;
  response: string;
  rawResponse: string;
  toolCalls: unknown[];
  actualState: Record<string, unknown>;
  httpStatus: number;
  executionStatus: ExecutionStatus;
  errorMessage?: string;
  latencyMs: number;
};

async function executeTest(endpointUrl: string, test: VerificationTest, endpointAuthType?: EndpointAuthType, endpointSecretArn?: string, endpointAuthHeaderName?: string): Promise<ExecutionResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const startTime = Date.now();
  let executionStatus: ExecutionStatus = "success";
  let errorMessage: string | undefined;

  try {
    const headers: Record<string, string> = { "content-type": "application/json", accept: "application/json" };
    const endpointSecret = endpointSecretArn ? await getSecretString(endpointSecretArn) : undefined;
    Object.assign(headers, buildEndpointAuthHeaders(endpointAuthType, endpointSecret, endpointAuthHeaderName));
    
    let endpoint: ResolvedEndpoint;
    try {
      endpoint = await resolvePublicEndpoint(endpointUrl);
    } catch (error) {
      executionStatus = "dns_error";
      errorMessage = error instanceof Error ? error.message : "DNS resolution failed.";
      throw error;
    }

    let response: { status: number; body: string };
    try {
      response = await postToResolvedEndpoint(endpoint, JSON.stringify({ message: test.inputMessage, session_id: \`agentproof-\${test.id}\` }), headers, controller.signal);
    } catch (error) {
      const isAbort = error instanceof Error && error.name === "AbortError";
      executionStatus = isAbort ? "timeout" : "connection_error";
      errorMessage = error instanceof Error ? error.message : "Connection failed.";
      if (!isAbort && error instanceof Error && error.message.includes("SSL")) executionStatus = "tls_error";
      throw error;
    }

    const raw = response.body;
    let payload: AgentResponse = {};
    const httpStatus = response.status;
    if (httpStatus >= 400) {
      executionStatus = "http_error";
      errorMessage = \`Agent returned HTTP \${httpStatus}.\`;
    }

    try { 
      payload = JSON.parse(raw) as AgentResponse; 
    } catch {
      if (executionStatus === "success") {
        executionStatus = "parse_error";
        errorMessage = "Agent response was not valid JSON.";
      }
    }
    
    return {
      ok: httpStatus >= 200 && httpStatus < 300,
      response: payload.response ?? raw,
      rawResponse: raw,
      toolCalls: boundedToolCalls(Array.isArray(payload.tool_calls) ? payload.tool_calls : []),
      actualState: boundedState(payload.metadata?.state ?? {}),
      httpStatus,
      executionStatus,
      errorMessage,
      latencyMs: Date.now() - startTime
    };
  } catch (error) {
     return {
       ok: false,
       response: "",
       rawResponse: "",
       toolCalls: [],
       actualState: {},
       httpStatus: 0,
       executionStatus: executionStatus !== "success" ? executionStatus : "internal_error",
       errorMessage: errorMessage || (error instanceof Error ? error.message : "Execution failed."),
       latencyMs: Date.now() - startTime
     };
  } finally {
    clearTimeout(timeout);
  }
}`
);

newContent = newContent.replace(
  /export function deterministicCheck\(test: VerificationTest, result: Awaited<ReturnType<typeof executeTest>>\) {[\s\S]*?return null;\n}/,
`export function deterministicCheck(test: VerificationTest, result: ExecutionResult) {
  const expected = test.expectedBehavior.toLowerCase();
  const toolCalls = result.toolCalls.map((tool) => JSON.stringify(tool).toLowerCase()).join(" ");
  if (!result.ok) return { result: "fail" as TestResult, severity: "major" as const, whyItFailed: result.errorMessage || \`Agent endpoint returned HTTP \${result.httpStatus}.\` };
  if (expected.includes("must not") && toolCalls) {
    const prohibited = expected.split("must not")[1]?.trim().split(/\\s+/)[0];
    if (prohibited && toolCalls.includes(prohibited)) {
      return { result: "critical_fail" as TestResult, severity: "critical" as const, whyItFailed: "The agent performed a prohibited tool action." };
    }
  }
  return null;
}`
);

newContent = newContent.replace(
  /let execution: Awaited<ReturnType<typeof executeTest>>;[\s\S]*?if \(judgment\.result !== "pass"\) evidenceSummary\.push\(\{ whyItFailed: judgmentSummary, severity: judgment\.severity \}\);/,
`let execution: ExecutionResult;
    let judgment: { result: TestResult; severity: Evidence["severity"]; whyItFailed: string };
    let judgedBy: TestRun["judgedBy"] = "deterministic";
    let judgeStatus: string | undefined;
    let judgeError: string | undefined;
    
    execution = await executeTest(agent.endpointUrl, test, agent.endpointAuthType, agent.endpointSecretArn, agent.endpointAuthHeaderName);
    
    if (execution.executionStatus !== "success" && execution.executionStatus !== "http_error" && execution.executionStatus !== "parse_error") {
      judgment = { result: "fail", severity: "major", whyItFailed: execution.errorMessage || "Execution failed." };
    } else {
      const deterministic = deterministicCheck(test, execution);
      if (deterministic) judgment = deterministic;
      else {
        judgedBy = "llm";
        try {
          judgment = await judgeSemantics({ expectedBehavior: test.expectedBehavior, actualResponse: execution.response, toolCalls: execution.toolCalls });
          judgeStatus = "success";
        } catch (error) {
          judgment = { result: "fail", severity: "major", whyItFailed: "Semantic evaluation failed." };
          execution.executionStatus = "evaluator_error";
          judgeStatus = "error";
          judgeError = error instanceof Error ? error.message : "Unknown judge error";
        }
      }
    }

    const judgmentSummary = judgment.result === "pass"
      ? "Assertion satisfied."
      : judgment.whyItFailed.trim() || "The agent response did not satisfy the expected behavior.";
    results.push({ test, result: judgment.result });
    if (judgment.result === "critical_fail") critical += 1;
    let rawPayloadS3Key: string | undefined;
    if (execution.rawResponse.length > MAX_DYNAMODB_RESPONSE_CHARS) {
      rawPayloadS3Key = await putRawResponse(\`runs/\${runId}/tests/\${test.id}/response.json\`, execution.rawResponse).catch((error) => {
        console.error("Unable to store large agent response", error);
        return undefined;
      });
    }
    const testRun: TestRun = {
      id: \`test_run_\${runId}_\${test.id}\`,
      verificationRunId: runId,
      testId: test.id,
      agentResponse: execution.response.slice(0, MAX_DYNAMODB_RESPONSE_CHARS),
      rawPayloadS3Key,
      toolCalls: execution.toolCalls,
      actualState: execution.actualState,
      expectedState: {},
      result: judgment.result,
      executionStatus: execution.executionStatus,
      httpStatus: execution.httpStatus,
      latencyMs: execution.latencyMs,
      errorCode: execution.errorCode,
      errorMessage: execution.errorMessage,
      judgeStatus,
      judgeError,
      judgedBy,
      runAt: started
    };
    await saveTestRun(testRun);
    await saveEvidence({
      id: \`evidence_\${runId}_\${test.id}\`,
      testRunId: testRun.id,
      verificationRunId: runId,
      expectedBehavior: test.expectedBehavior,
      actualBehavior: execution.response.slice(0, MAX_DYNAMODB_RESPONSE_CHARS),
      rawPayloadS3Key,
      toolCalls: execution.toolCalls,
      expectedState: {},
      actualState: execution.actualState,
      whyItFailed: judgmentSummary,
      executionStatus: execution.executionStatus,
      httpStatus: execution.httpStatus,
      latencyMs: execution.latencyMs,
      errorCode: execution.errorCode,
      errorMessage: execution.errorMessage,
      judgeStatus,
      judgeError,
      severity: judgment.severity,
      reproductionInput: test.inputMessage,
      createdAt: started
    });
    if (judgment.result !== "pass") evidenceSummary.push({ whyItFailed: judgmentSummary, severity: judgment.severity });`
);

fs.writeFileSync("workers/test-runner-worker/handler.ts", newContent, "utf-8");
console.log("Updated handler.ts");
