export type VerificationStatus =
  | "VERIFIED"
  | "CONDITIONAL"
  | "FAILED"
  | "BLOCKED";

export type TestType = "happy" | "edge" | "boundary" | "adversarial";

export type RegionalCoverageStatus = "not_requested" | "pending" | "generated" | "tested";

export type JudgmentMethod = "deterministic" | "tool_call" | "llm";

export type Agent = {
  id: string;
  ownerId: string;
  name: string;
  endpointUrl: string;
  endpointAuthType?: "none" | "bearer";
  endpointSecretArn?: string;
  currentVersion: string;
  createdAt: string;
};

export type FailureRule = {
  rule: string;
  action: string;
  severity: "info" | "minor" | "major" | "critical";
};

export type AgentContract = {
  id: string;
  agentId: string;
  version: string;
  capabilities: string[];
  restrictions: string[];
  requiredBehavior: string[];
  failurePolicy: FailureRule[];
  createdAt: string;
};

export type VerificationTest = {
  id: string;
  agentId: string;
  contractId: string;
  type: TestType;
  languageCode: string;
  sourceTestId?: string;
  languageGroupId?: string;
  regionalCoverageStatus?: RegionalCoverageStatus;
  inputMessage: string;
  expectedBehavior: string;
  createdAt: string;
};

export type VerificationRunStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export type TestResult = "pass" | "fail" | "critical_fail";

export type TestRun = {
  id: string;
  verificationRunId: string;
  testId: string;
  agentResponse: string;
  rawPayloadS3Key?: string;
  toolCalls: unknown[];
  actualState: Record<string, unknown>;
  expectedState: Record<string, unknown>;
  result: TestResult;
  judgedBy: JudgmentMethod;
  runAt: string;
};

export type VerificationRun = {
  id: string;
  agentId: string;
  ownerId: string;
  agentVersion: string;
  contractVersion: string;
  testSuiteVersion: string;
  status: VerificationRunStatus;
  startedAt: string;
  completedAt?: string;
  totalTests: number;
  passed: number;
  failed: number;
  criticalFailed: number;
};

export type VerificationStatusRecord = {
  id: string;
  verificationRunId: string;
  agentId: string;
  agentVersion: string;
  overallScore: number;
  status: VerificationStatus;
  issuedAt: string;
  validUntil: string;
  publicId: string;
  hash: string;
  score: ReliabilityScore;
  agentName: string;
  totalTests: number;
  passed: number;
  failed: number;
  critical: number;
  lastVerified: string;
  whatWasTested: string[];
  evidenceSummary: Array<Pick<Evidence, "whyItFailed" | "severity">>;
};

export type Evidence = {
  id: string;
  testRunId: string;
  verificationRunId?: string;
  expectedBehavior: string;
  actualBehavior: string;
  rawPayloadS3Key?: string;
  toolCalls: unknown[];
  expectedState: Record<string, unknown>;
  actualState: Record<string, unknown>;
  whyItFailed: string;
  severity: "info" | "minor" | "major" | "critical";
  reproductionInput: string;
  createdAt: string;
};

export type ReliabilityScore = {
  taskSuccess: number;
  toolCorrectness: number;
  policyAdherence: number;
  stateIntegrity: number;
  robustness: number;
  consistency?: number;
  efficiency: number;
  overallScore: number;
};

export type PublicReport = {
  publicId: string;
  agentName: string;
  agentVersion: string;
  status: VerificationStatus;
  score: ReliabilityScore;
  totalTests: number;
  passed: number;
  failed: number;
  critical: number;
  lastVerified: string;
  validUntil: string;
  whatWasTested: string[];
  evidenceSummary: Array<Pick<Evidence, "whyItFailed" | "severity">>;
  hash: string;
};
