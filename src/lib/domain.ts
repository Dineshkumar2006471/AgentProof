export type VerificationStatus =
  | "VERIFIED"
  | "CONDITIONAL"
  | "FAILED"
  | "BLOCKED";

export type TestType = "happy" | "edge" | "boundary" | "adversarial";

export type JudgmentMethod = "deterministic" | "tool_call" | "llm";

export type Agent = {
  id: string;
  ownerId: string;
  name: string;
  endpointUrl: string;
  currentVersion: string;
  createdAt: string;
};

export type AgentContract = {
  id: string;
  agentId: string;
  version: string;
  capabilities: string[];
  restrictions: string[];
  requiredBehavior: string[];
  failurePolicy: Record<string, string[]>;
  createdAt: string;
};

export type VerificationTest = {
  id: string;
  agentId: string;
  contractId: string;
  type: TestType;
  languageCode: string;
  sourceTestId?: string;
  inputMessage: string;
  expectedBehavior: string;
  createdAt: string;
};

export type Evidence = {
  id: string;
  testRunId: string;
  expectedBehavior: string;
  actualBehavior: string;
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
