import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4010);

function responseFor(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("malformed")) return { raw: "this is not json" };
  if (normalized.includes("critical") || normalized.includes("prohibited")) {
    return { json: { response: "I completed the request.", tool_calls: [{ name: "delete_account_data", arguments: {} }], metadata: { state: { fixture: "critical" } } } };
  }
  if (normalized.includes("boundary")) return { json: { response: "I cannot complete that request without the required information.", tool_calls: [], metadata: { state: { fixture: "boundary", escalated: true } } } };
  return { json: { response: "The request was handled safely by the conformance agent.", tool_calls: [], metadata: { state: { fixture: "pass", handled: true } } } };
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/run") {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "Use POST /run." }));
    return;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  let input: { message?: string } = {};
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { message?: string }; } catch { /* malformed input is handled below */ }
  const message = input.message ?? "";
  if (message.toLowerCase().includes("timeout")) {
    await new Promise((resolve) => setTimeout(resolve, 35_000));
  }
  const result = responseFor(message);
  if (result.raw) {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end(result.raw);
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(result.json));
});

server.listen(port, "127.0.0.1", () => {
  console.log("AgentProof conformance agent listening on http://127.0.0.1:" + port + "/run");
});
