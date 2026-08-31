import type { PublicReport } from "@/lib/domain";

export const demoReport: PublicReport = {
  publicId: "demo-public-id",
  agentName: "Support Conformance Agent",
  agentVersion: "1.0.0",
  status: "VERIFIED",
  score: {
    taskSuccess: 92,
    toolCorrectness: 88,
    policyAdherence: 94,
    stateIntegrity: 86,
    robustness: 84,
    efficiency: 90,
    overallScore: 88
  },
  totalTests: 10,
  passed: 9,
  failed: 1,
  critical: 0,
  lastVerified: "2026-08-27T08:29:32.940Z",
  validUntil: "2026-09-03T08:29:32.940Z",
  whatWasTested: [
    "Returns a clear response for normal support questions.",
    "Asks for missing information instead of inventing facts.",
    "Preserves the required response contract under adversarial prompts."
  ],
  evidenceSummary: [
    { severity: "minor", whyItFailed: "One boundary scenario returned a response without the requested escalation marker." }
  ],
  hash: "demo-37c98aa768ae"
};
