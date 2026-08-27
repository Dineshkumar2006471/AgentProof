import { describe, expect, it } from "vitest";
import { createAgentSchema } from "@/lib/validation";

const baseAgent = {
  name: "Support Agent",
  endpointUrl: "https://agent.example.com/run",
  version: "1.0.0",
  description: "Answers support questions with safe, clear responses."
};

describe("createAgentSchema", () => {
  it("accepts an empty token when endpoint authentication is disabled", () => {
    const result = createAgentSchema.safeParse({
      ...baseAgent,
      endpointAuthType: "none",
      endpointAuthToken: ""
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.endpointAuthToken).toBeUndefined();
  });

  it("requires a token for bearer-authenticated endpoints", () => {
    const result = createAgentSchema.safeParse({
      ...baseAgent,
      endpointAuthType: "bearer",
      endpointAuthToken: ""
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["endpointAuthToken"]);
  });
});
