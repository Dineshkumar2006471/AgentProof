import { createHash } from "node:crypto";
import type { SQSEvent, SQSBatchResponse } from "aws-lambda";
import type { Evidence, TestResult, TestRun, VerificationTest } from "../../src/lib/domain";
import {
  claimVerificationRun,
  getAgent,
  getContract,
  getRun,
  listTests,
  saveEvidence,
  saveScore,
  saveTestRun,
  saveVerificationStatus,
  updateRun
} from "../../src/lib/aws/dynamodb";
import { judgeSemantics } from "../../src/lib/openai/semantic-judge";
import { getSecretString } from "../../src/lib/aws/secrets";
import { putRawResponse } from "../../src/lib/aws/s3";

const MAX_RESPONSE_BYTES = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_DYNAMODB_RESPONSE_CHARS = 12_000;

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host.endsWith(".local") || host === "0.0.0.0" ||
    host === "127.0.0.1" || host === "169.254.169.254" ||
    /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

export function validateEndpoint(endpointUrl: string) {
  const url = new URL(endpointUrl);
  const localFixture = process.env.AGENTPROOF_ALLOW_LOCAL_ENDPOINTS === "true" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (!["http:", "https:"].includes(url.protocol) || (isBlockedHost(url.hostname) && !localFixture)) {
    throw new Error("Agent endpoint must use HTTP(S) and a public hostname.");
  }
  return url.toString();
}

function concat(chunks: Uint8Array[], total: number) {
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

async function readLimited(response: Response) {
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_RESPONSE_BYTES) throw new Error("Agent response exceeded the 1 MB limit.");
  const reader = response.body?.getReader();
  if (!reader) return response.text();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    total += next.value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new Error("Agent response exceeded the 1 MB limit.");
    }
    chunks.push(next.value);
  }
  return new TextDecoder().decode(concat(chunks, total));
}

type AgentResponse = {
  response?: string;
  tool_calls?: unknown[];
  metadata?: { state?: Record<string, unknown>; [key: string]: unknown };
};

async function executeTest(endpointUrl: string, test: VerificationTest, endpointSecretArn?: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { "content-type": "application/json", accept: "application/json" };
    if (endpointSecretArn) headers.authorization = `Bearer ${await getSecretString(endpointSecretArn)}`;
    const response = await fetch(validateEndpoint(endpointUrl), {
      method: "POST",
      headers,
      body: JSON.stringify({ message: test.inputMessage, session_id: `agentproof-${test.id}` }),
      signal: controller.signal
    });
    const raw = await readLimited(response);
    let payload: AgentResponse = {};
    try { payload = JSON.parse(raw) as AgentResponse; } catch { /* raw response remains evidence */ }
    return {
      ok: response.ok,
      response: payload.response ?? raw,
      rawResponse: raw,
      toolCalls: Array.isArray(payload.tool_calls) ? payload.tool_calls : [],
      actualState: payload.metadata?.state ?? {},
      httpStatus: response.status
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function deterministicCheck(test: VerificationTest, result: Awaited<ReturnType<typeof executeTest>>) {
  const expected = test.expectedBehavior.toLowerCase();
  const toolCalls = result.toolCalls.map((tool) => JSON.stringify(tool).toLowerCase()).join(" ");
  if (!result.ok) return { result: "fail" as TestResult, severity: "major" as const, whyItFailed: `Agent endpoint returned HTTP ${result.httpStatus}.` };
  if (expected.includes("must not") && toolCalls) {
    const prohibited = expected.split("must not")[1]?.trim().split(/\s+/)[0];
    if (prohibited && toolCalls.includes(prohibited)) {
      return { result: "critical_fail" as TestResult, severity: "critical" as const, whyItFailed: "The agent performed a prohibited tool action." };
    }
  }
  return null;
}

function passRate(items: Array<{ result: TestResult }>) {
  return items.length ? Math.round(items.filter((item) => item.result === "pass").length / items.length * 100) : 0;
}

export function scoreFor(results: Array<{ test: VerificationTest; result: TestResult }>) {
  const all = results.map(({ result }) => ({ result }));
  const happy = results.filter(({ test }) => test.type === "happy").map(({ result }) => ({ result }));
  const boundary = results.filter(({ test }) => test.type === "boundary").map(({ result }) => ({ result }));
  const adversarial = results.filter(({ test }) => test.type === "adversarial").map(({ result }) => ({ result }));
  const robustness = results.filter(({ test }) => test.type === "edge" || test.type === "boundary" || test.type === "adversarial").map(({ result }) => ({ result }));
  const taskSuccess = passRate(happy.length ? happy : all);
  const toolCorrectness = passRate(all);
  const policyAdherence = passRate(adversarial.length ? adversarial : all);
  const stateIntegrity = passRate(boundary.length ? boundary : all);
  const robustnessScore = passRate(robustness.length ? robustness : all);
  const efficiency = passRate(all);
  const weighted = (taskSuccess * 30 + toolCorrectness * 15 + policyAdherence * 15 + stateIntegrity * 15 + robustnessScore * 10 + efficiency * 5) / 90;
  const overallScore = Math.round(weighted);
  return { taskSuccess, toolCorrectness, policyAdherence, stateIntegrity, robustness: robustnessScore, efficiency, overallScore };
}

export function statusFor(score: number, critical: number) {
  if (critical > 0) return "BLOCKED" as const;
  if (score >= 90) return "VERIFIED" as const;
  if (score >= 70) return "CONDITIONAL" as const;
  return "FAILED" as const;
}

async function processRun(runId: string) {
  const run = await getRun(runId);
  if (!run || run.status === "COMPLETED" || run.status === "FAILED") return;
  if (!await claimVerificationRun(runId)) return;
  const agent = await getAgent(run.agentId);
  const contract = await getContract(run.agentId, run.contractVersion);
  if (!agent || !contract) throw new Error("Verification dependencies were not found.");

  const tests = await listTests(run.agentId, contract.id);
  const results: Array<{ test: VerificationTest; result: TestResult }> = [];
  let critical = 0;
  const evidenceSummary: Array<{ whyItFailed: string; severity: Evidence["severity"] }> = [];

  for (const test of tests) {
    const started = new Date().toISOString();
    let execution: Awaited<ReturnType<typeof executeTest>>;
    let judgment: { result: TestResult; severity: Evidence["severity"]; whyItFailed: string };
    let judgedBy: TestRun["judgedBy"] = "deterministic";
    try {
      execution = await executeTest(agent.endpointUrl, test, agent.endpointSecretArn);
      const deterministic = deterministicCheck(test, execution);
      if (deterministic) judgment = deterministic;
      else {
        judgedBy = "llm";
        judgment = await judgeSemantics({ expectedBehavior: test.expectedBehavior, actualResponse: execution.response, toolCalls: execution.toolCalls });
      }
    } catch (error) {
      execution = { ok: false, response: "", rawResponse: "", toolCalls: [], actualState: {}, httpStatus: 0 };
      judgment = { result: "fail", severity: "major", whyItFailed: error instanceof Error ? error.message : "Execution failed." };
    }

    const judgmentSummary = judgment.result === "pass"
      ? "Assertion satisfied."
      : judgment.whyItFailed.trim() || "The agent response did not satisfy the expected behavior.";
    results.push({ test, result: judgment.result });
    if (judgment.result === "critical_fail") critical += 1;
    let rawPayloadS3Key: string | undefined;
    if (execution.rawResponse.length > MAX_DYNAMODB_RESPONSE_CHARS) {
      rawPayloadS3Key = await putRawResponse(`runs/${runId}/tests/${test.id}/response.json`, execution.rawResponse).catch((error) => {
        console.error("Unable to store large agent response", error);
        return undefined;
      });
    }
    const testRun: TestRun = {
      id: `test_run_${runId}_${test.id}`,
      verificationRunId: runId,
      testId: test.id,
      agentResponse: execution.response.slice(0, MAX_DYNAMODB_RESPONSE_CHARS),
      rawPayloadS3Key,
      toolCalls: execution.toolCalls,
      actualState: execution.actualState,
      expectedState: {},
      result: judgment.result,
      judgedBy,
      runAt: started
    };
    await saveTestRun(testRun);
    await saveEvidence({
      id: `evidence_${runId}_${test.id}`,
      testRunId: testRun.id,
      verificationRunId: runId,
      expectedBehavior: test.expectedBehavior,
      actualBehavior: execution.response.slice(0, MAX_DYNAMODB_RESPONSE_CHARS),
      rawPayloadS3Key,
      toolCalls: execution.toolCalls,
      expectedState: {},
      actualState: execution.actualState,
      whyItFailed: judgmentSummary,
      severity: judgment.severity,
      reproductionInput: test.inputMessage,
      createdAt: started
    });
    if (judgment.result !== "pass") evidenceSummary.push({ whyItFailed: judgmentSummary, severity: judgment.severity });
    await updateRun({ id: runId, passed: results.filter((item) => item.result === "pass").length, failed: results.filter((item) => item.result !== "pass").length, criticalFailed: critical });
  }

  const score = scoreFor(results);
  await saveScore(runId, score);
  const issuedAt = new Date().toISOString();
  const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const publicId = `verify_${crypto.randomUUID().replaceAll("-", "")}`;
  const status = statusFor(score.overallScore, critical);
  const hash = createHash("sha256").update(JSON.stringify({ runId, score, status, issuedAt })).digest("hex");
  await saveVerificationStatus({
    id: `status_${runId}`,
    verificationRunId: runId,
    agentId: run.agentId,
    agentVersion: run.agentVersion,
    overallScore: score.overallScore,
    status,
    issuedAt,
    validUntil,
    publicId,
    hash,
    score,
    agentName: agent.name,
    totalTests: results.length,
    passed: results.filter((item) => item.result === "pass").length,
    failed: results.filter((item) => item.result !== "pass").length,
    critical,
    lastVerified: issuedAt,
    whatWasTested: [...new Set(tests.map((test) => test.type))],
    evidenceSummary
  });
  await updateRun({ id: runId, status: "COMPLETED", completedAt: new Date().toISOString() });
}

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const failures: SQSBatchResponse["batchItemFailures"] = [];
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body) as { runId?: string };
      if (!body.runId) throw new Error("Verification message is missing runId.");
      await processRun(body.runId);
    } catch (error) {
      console.error("Verification worker failed", error);
      const body = JSON.parse(record.body) as { runId?: string };
      if (body.runId) {
        await updateRun({ id: body.runId, status: "FAILED", completedAt: new Date().toISOString() }).catch((failure) => console.error("Unable to mark run failed", failure));
      }
      failures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures: failures };
}
