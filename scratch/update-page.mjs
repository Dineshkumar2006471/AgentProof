import fs from "node:fs";

const content = fs.readFileSync("src/app/agents/[id]/run/page.tsx", "utf-8");

const diagnosticFunction = `
function getDiagnosticMessage(result: TestRun) {
  if (result.executionStatus === "success") {
    return result.agentResponse || "Agent returned an empty response.";
  }
  if (result.executionStatus === "timeout") return "Agent request timed out.";
  if (result.executionStatus === "dns_error") return "Agent hostname could not be resolved.";
  if (result.executionStatus === "tls_error") return "Agent endpoint failed TLS handshake.";
  if (result.executionStatus === "connection_error") return "Agent endpoint refused connection.";
  if (result.executionStatus === "http_error") return \`Agent returned HTTP \${result.httpStatus || 500}.\`;
  if (result.executionStatus === "parse_error") return "Agent response was not valid JSON.";
  if (result.executionStatus === "evaluator_error") return "Agent responded, but semantic evaluation failed.";
  if (result.executionStatus === "internal_error") return "Internal execution error occurred.";
  return result.agentResponse || "No response recorded.";
}
`;

let newContent = content.replace(
  "export default function VerificationRun() {",
  diagnosticFunction + "\nexport default function VerificationRun() {"
);

newContent = newContent.replace(
  /{result\.agentResponse \|\| "No response recorded\."}/g,
  "{getDiagnosticMessage(result)}"
);

newContent = newContent.replace(
  /\${item\.agentResponse \|\| "No response"}/g,
  "${getDiagnosticMessage(item)}"
);

fs.writeFileSync("src/app/agents/[id]/run/page.tsx", newContent, "utf-8");
console.log("Updated page.tsx");
