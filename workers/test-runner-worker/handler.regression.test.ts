import { describe, expect, it, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { createServer, type Server } from "node:http";
import { executeTest, processRun } from "./handler";
import * as ddb from "../../src/lib/aws/dynamodb";
import * as judge from "../../src/lib/openai/semantic-judge";
import type { VerificationTest } from "../../src/lib/domain";

vi.mock("../../src/lib/aws/dynamodb");
vi.mock("../../src/lib/openai/semantic-judge");
vi.mock("../../src/lib/aws/s3");
vi.mock("../../src/lib/aws/secrets", () => ({
  getSecretString: vi.fn().mockResolvedValue("secret")
}));

let server: Server;
let port: number;
let currentHandler: (req: any, res: any) => void;

beforeAll(async () => {
  process.env.AGENTPROOF_ALLOW_LOCAL_ENDPOINTS = "true";
  server = createServer((req, res) => {
    if (currentHandler) currentHandler(req, res);
    else { res.statusCode = 200; res.end(JSON.stringify({ response: "default" })); }
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      port = (server.address() as any).port;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

const defaultTest: VerificationTest = {
  id: "test1",
  agentId: "agent1",
  contractId: "contract1",
  type: "happy",
  inputMessage: "hello",
  expectedBehavior: "say hello",
  languageCode: "en",
  createdAt: new Date().toISOString()
};

describe("handler executeTest regressions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("1. successful agent response", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ response: "ok", tool_calls: [] })); };
    const res = await executeTest(`http://127.0.0.1:${port}/`, defaultTest);
    expect(res.ok).toBe(true);
    expect(res.executionStatus).toBe("success");
    expect(res.response).toBe("ok");
  });

  it("2. DNS failure", async () => {
    const res = await executeTest(`http://this-does-not-exist.invalid/`, defaultTest);
    expect(res.ok).toBe(false);
    expect(res.executionStatus).toBe("dns_error");
  });

  it("3. timeout", async () => {
    currentHandler = (req, res) => { /* never respond */ };
    const res = await executeTest(`http://127.0.0.1:${port}/`, defaultTest);
    expect(res.ok).toBe(false);
    expect(res.executionStatus).toBe("timeout");
  }, 35000); // 30s timeout

  it("4. TLS failure", async () => {
    // trying to speak HTTPS to an HTTP server causes a TLS/SSL error
    const res = await executeTest(`https://127.0.0.1:${port}/`, defaultTest);
    expect(res.ok).toBe(false);
    expect(res.executionStatus).toBe("connection_error"); // or tls_error depending on node version, but wait, http module says "socket hang up" or "Client network socket disconnected before secure TLS connection was established". Usually maps to connection_error or tls_error.
    expect(["connection_error", "tls_error"]).toContain(res.executionStatus);
  });

  it("5. connection failure", async () => {
    const res = await executeTest(`http://127.0.0.1:4/`, defaultTest); // port 4 is basically unused/blocked
    expect(res.ok).toBe(false);
    expect(res.executionStatus).toBe("connection_error");
  });

  it("6. HTTP 4xx", async () => {
    currentHandler = (req, res) => { res.statusCode = 404; res.end("Not Found"); };
    const res = await executeTest(`http://127.0.0.1:${port}/`, defaultTest);
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(404);
    expect(res.executionStatus).toBe("http_error");
  });

  it("7. HTTP 5xx", async () => {
    currentHandler = (req, res) => { res.statusCode = 500; res.end("Server Error"); };
    const res = await executeTest(`http://127.0.0.1:${port}/`, defaultTest);
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(500);
    expect(res.executionStatus).toBe("http_error");
  });

  it("8. malformed JSON", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end("{ bad json"); };
    const res = await executeTest(`http://127.0.0.1:${port}/`, defaultTest);
    expect(res.ok).toBe(true);
    expect(res.executionStatus).toBe("parse_error");
    expect(res.response).toBe("{ bad json");
  });

  it("9. empty response", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end(""); };
    const res = await executeTest(`http://127.0.0.1:${port}/`, defaultTest);
    expect(res.ok).toBe(true);
    expect(res.executionStatus).toBe("parse_error");
    expect(res.response).toBe("");
  });
});

describe("handler processRun regressions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(ddb, "getRun").mockResolvedValue({ id: "run1", agentId: "agent1", contractVersion: "v1", status: "RUNNING" } as any);
    vi.spyOn(ddb, "claimVerificationRun").mockResolvedValue(true);
    vi.spyOn(ddb, "getAgent").mockResolvedValue({ endpointUrl: `http://127.0.0.1:${port}/`, name: "Test" } as any);
    vi.spyOn(ddb, "getContract").mockResolvedValue({ id: "contract1" } as any);
    vi.spyOn(ddb, "listTests").mockResolvedValue([defaultTest]);
  });

  it("10. successful agent response + OpenAI judge failure", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ response: "i did it" })); };
    vi.spyOn(judge, "judgeSemantics").mockRejectedValue(new Error("OpenAI down"));
    const saveTestRunMock = vi.spyOn(ddb, "saveTestRun");

    await processRun("run1");

    expect(saveTestRunMock).toHaveBeenCalledWith(expect.objectContaining({
      result: "fail",
      executionStatus: "evaluator_error",
      agentResponse: "i did it", // Ensure we still have the response!
      judgeStatus: "error",
      judgedBy: "llm"
    }));
  });

  it("11. successful agent response + DynamoDB persistence failure", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ response: "i did it" })); };
    vi.spyOn(judge, "judgeSemantics").mockResolvedValue({ result: "pass", severity: "info", whyItFailed: "" });
    vi.spyOn(ddb, "saveTestRun").mockRejectedValueOnce(new Error("DDB out of capacity"));
    
    await expect(processRun("run1")).rejects.toThrow("DDB out of capacity");
  });

  it("12. normal semantic pass", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ response: "i did it" })); };
    vi.spyOn(judge, "judgeSemantics").mockResolvedValue({ result: "pass", severity: "info", whyItFailed: "" });
    const saveTestRunMock = vi.spyOn(ddb, "saveTestRun");

    await processRun("run1");
    expect(saveTestRunMock).toHaveBeenCalledWith(expect.objectContaining({ result: "pass", executionStatus: "success" }));
  });

  it("13. semantic fail", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ response: "i did it poorly" })); };
    vi.spyOn(judge, "judgeSemantics").mockResolvedValue({ result: "fail", severity: "major", whyItFailed: "bad" });
    const saveTestRunMock = vi.spyOn(ddb, "saveTestRun");

    await processRun("run1");
    expect(saveTestRunMock).toHaveBeenCalledWith(expect.objectContaining({ result: "fail", executionStatus: "success", errorMessage: undefined }));
  });

  it("14. critical fail", async () => {
    currentHandler = (req, res) => { res.statusCode = 200; res.end(JSON.stringify({ response: "i did it poorly", tool_calls: [{ name: "drop_table" }] })); };
    const criticalTest = { ...defaultTest, expectedBehavior: "must not drop_table" };
    vi.spyOn(ddb, "listTests").mockResolvedValue([criticalTest]);
    const saveTestRunMock = vi.spyOn(ddb, "saveTestRun");

    await processRun("run1");
    // Deterministic check should catch "must not"
    expect(saveTestRunMock).toHaveBeenCalledWith(expect.objectContaining({ result: "critical_fail", executionStatus: "success", judgedBy: "deterministic" }));
  });
});
