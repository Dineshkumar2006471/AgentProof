import type { Agent, PublicReport } from "@/lib/domain";

export const sampleAgents: Array<
  Agent & { latestStatus: PublicReport["status"]; overallScore?: number }
> = [
  {
    id: "agent_dentalbot",
    ownerId: "user_demo",
    name: "DentalBot",
    endpointUrl: "https://example.com/run",
    currentVersion: "1.4",
    createdAt: "2026-08-22T10:00:00.000Z",
    latestStatus: "VERIFIED",
    overallScore: 94
  },
  {
    id: "agent_leadbot",
    ownerId: "user_demo",
    name: "LeadBot",
    endpointUrl: "https://example.com/run",
    currentVersion: "1.0",
    createdAt: "2026-08-21T10:00:00.000Z",
    latestStatus: "CONDITIONAL",
    overallScore: 76
  },
  {
    id: "agent_supportbot",
    ownerId: "user_demo",
    name: "SupportBot",
    endpointUrl: "https://example.com/run",
    currentVersion: "2.1",
    createdAt: "2026-08-20T10:00:00.000Z",
    latestStatus: "BLOCKED"
  }
];

export const samplePublicReport: PublicReport = {
  publicId: "verify_demo",
  agentName: "DentalBot",
  agentVersion: "1.4",
  status: "VERIFIED",
  score: {
    taskSuccess: 97,
    toolCorrectness: 95,
    policyAdherence: 99,
    stateIntegrity: 92,
    robustness: 88,
    efficiency: 93,
    overallScore: 94
  },
  totalTests: 184,
  passed: 179,
  failed: 5,
  critical: 0,
  lastVerified: "22 Aug 2026",
  validUntil: "29 Aug 2026",
  whatWasTested: [
    "booking",
    "rescheduling",
    "availability",
    "safety restrictions",
    "failure recovery",
    "prompt-injection resistance"
  ],
  evidenceSummary: [
    {
      severity: "minor",
      whyItFailed:
        "The agent gave a vague fallback when appointment availability was temporarily unavailable."
    }
  ],
  hash: "0x8F92A1B4C7D5E6F890AB1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2"
};
