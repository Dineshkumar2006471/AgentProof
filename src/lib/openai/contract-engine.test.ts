import { describe, expect, it } from "vitest";
import { zodResponseFormat } from "openai/helpers/zod";
import { contractDraftSchema } from "@/lib/openai/contract-engine";

describe("contract structured output", () => {
  it("accepts a complete strict contract draft", () => {
    const draft = contractDraftSchema.parse({
      capabilities: ["answer booking questions"],
      restrictions: ["never expose secrets"],
      requiredBehavior: ["escalate emergencies"],
      failurePolicy: [{ rule: "emergency request", action: "escalate to a human", severity: "critical" }]
    });
    expect(draft.failurePolicy).toHaveLength(1);
    expect(zodResponseFormat(contractDraftSchema, "agent_contract").type).toBe("json_schema");
  });

  it("rejects a missing required failure policy", () => {
    expect(() => contractDraftSchema.parse({
      capabilities: ["answer booking questions"],
      restrictions: [],
      requiredBehavior: ["escalate emergencies"]
    })).toThrow();
  });
});
