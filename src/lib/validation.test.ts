import { describe, expect, it } from "vitest";
import { createAgentSchema, resetPasswordSchema, signUpSchema } from "@/lib/validation";

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

  it("accepts API key and Basic authentication credentials", () => {
    const apiKey = createAgentSchema.safeParse({
      ...baseAgent,
      endpointAuthType: "api_key",
      endpointAuthToken: "example-key",
      endpointAuthHeaderName: "x-api-key"
    });
    const basic = createAgentSchema.safeParse({
      ...baseAgent,
      endpointAuthType: "basic",
      endpointAuthUsername: "agentproof",
      endpointAuthToken: "secret"
    });

    expect(apiKey.success).toBe(true);
    expect(basic.success).toBe(true);
  });

  it("rejects incomplete Basic authentication credentials", () => {
    const result = createAgentSchema.safeParse({
      ...baseAgent,
      endpointAuthType: "basic",
      endpointAuthUsername: "agentproof",
      endpointAuthToken: ""
    });

    expect(result.success).toBe(false);
  });
});

describe("account password validation", () => {
  it("accepts an eight-character password without complexity requirements", () => {
    const result = signUpSchema.safeParse({
      name: "Taylor Example",
      email: "taylor@example.com",
      password: "eightchr"
    });

    expect(result.success).toBe(true);
  });

  it("rejects passwords shorter than eight characters for sign-up and reset", () => {
    const signUp = signUpSchema.safeParse({
      name: "Taylor Example",
      email: "taylor@example.com",
      password: "short"
    });
    const reset = resetPasswordSchema.safeParse({
      email: "taylor@example.com",
      code: "123456",
      password: "short"
    });

    expect(signUp.success).toBe(false);
    expect(reset.success).toBe(false);
    if (!signUp.success) expect(signUp.error.issues[0]?.message).toBe("Use at least 8 characters.");
  });
});
