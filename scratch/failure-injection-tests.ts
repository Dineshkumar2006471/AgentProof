import { executeTest } from "../workers/test-runner-worker/handler";
import type { VerificationTest } from "../src/lib/domain";
import { createServer } from "node:http";

const dummyTest: VerificationTest = {
  id: "test-123",
  agentId: "agent-123",
  contractId: "contract-123",
  type: "happy",
  languageCode: "en",
  inputMessage: "Hello",
  expectedBehavior: "Say hi",
  createdAt: new Date().toISOString()
};

async function runTest(name: string, url: string, expectedStatus: string) {
  console.log(`\n--- Running: ${name} ---`);
  try {
    const result = await executeTest(url, dummyTest);
    console.log(`Execution Status: ${result.executionStatus}`);
    console.log(`Error Message: ${result.errorMessage || "None"}`);
    if (result.executionStatus !== expectedStatus) {
      console.error(`❌ Expected ${expectedStatus}, got ${result.executionStatus}`);
    } else {
      console.log(`✅ Success`);
    }
  } catch (err) {
    console.error("Test function threw an unexpected error:", err);
  }
}

async function main() {
  process.env.AGENTPROOF_ALLOW_LOCAL_ENDPOINTS = "true";

  // 1. DNS Error
  await runTest("DNS Error", "http://nonexistent.agent-proof.local-test", "dns_error");

  // 2. Timeout (We will mock a slow local server)
  const slowServer = createServer((req, res) => {
    // just hold the connection
  });
  slowServer.listen(4011, "127.0.0.1");
  // We need to temporarily mock REQUEST_TIMEOUT_MS in handler? We can't easily. It's 30,000ms.
  // Actually, wait. A connection timeout or fetch timeout will take 30s.

  // 3. HTTP 500
  const errServer = createServer((req, res) => {
    res.writeHead(500);
    res.end();
  });
  errServer.listen(4012, "127.0.0.1");
  await runTest("HTTP Error", "http://127.0.0.1:4012/run", "http_error");

  // 4. Parse Error
  const parseErrServer = createServer((req, res) => {
    res.writeHead(200);
    res.end("This is not JSON");
  });
  parseErrServer.listen(4013, "127.0.0.1");
  await runTest("Parse Error", "http://127.0.0.1:4013/run", "parse_error");

  // 5. Success
  const successServer = createServer((req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify({ response: "Hello there!" }));
  });
  successServer.listen(4014, "127.0.0.1");
  await runTest("Success", "http://127.0.0.1:4014/run", "success");

  slowServer.close();
  errServer.close();
  parseErrServer.close();
  successServer.close();
}

main().catch(console.error);
