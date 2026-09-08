import { describe, expect, it } from "vitest";
import { createAgentSchema, forgotPasswordSchema, googleAuthStartSchema, resetPasswordSchema, signUpSchema, updateAgentSchema } from "@/lib/validation";

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

describe("updateAgentSchema", () => {
  it("allows updating endpoint URL, name, and auth type", () => {
    const result = updateAgentSchema.safeParse({
      name: "Updated Agent Name",
      endpointUrl: "https://screen-snapshot-magic-80.lovable.app/api/chat",
      version: "1.1.0",
      endpointAuthType: "bearer",
      endpointAuthToken: "new-token-123"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endpointUrl).toBe("https://screen-snapshot-magic-80.lovable.app/api/chat");
      expect(result.data.name).toBe("Updated Agent Name");
    }
  });

  it("allows partial updates (only endpointUrl)", () => {
    const result = updateAgentSchema.safeParse({
      endpointUrl: "https://new-api.example.com/chat"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.endpointUrl).toBe("https://new-api.example.com/chat");
      expect(result.data.name).toBeUndefined();
    }
  });

  it("rejects non-HTTPS endpoint URLs in updates", () => {
    const result = updateAgentSchema.safeParse({
      endpointUrl: "http://insecure-api.example.com/chat"
    });

    expect(result.success).toBe(false);
  });
});

describe("account password validation", () => {
  it("accepts an eight-character password without complexity requirements", () => {
    const result = signUpSchema.safeParse({
      name: "Taylor Example",
      email: "taylor@example.com",
      password: "eightchr",
      acceptedPolicies: true
    });

    expect(result.success).toBe(true);
  });

  it("accepts a password with any character mix once it reaches eight characters", () => {
    const result = signUpSchema.safeParse({
      name: "Taylor Example",
      email: "taylor@example.com",
      password: "********",
      acceptedPolicies: true
    });

    expect(result.success).toBe(true);
  });

  it("rejects passwords shorter than eight characters for sign-up and reset", () => {
    const signUp = signUpSchema.safeParse({
      name: "Taylor Example",
      email: "taylor@example.com",
      password: "short",
      acceptedPolicies: true
    });
    const reset = resetPasswordSchema.safeParse({
      email: "taylor@example.com",
      code: "123456",
      password: "short"
    });

    expect(signUp.success).toBe(false);
    expect(reset.success).toBe(false);
    if (!signUp.success) expect(signUp.error.issues[0]?.message).toBe("Choose a password with at least 8 characters.");
  });

  it("requires policy acceptance for new accounts", () => {
    const result = signUpSchema.safeParse({ name: "Taylor Example", email: "taylor@example.com", password: "eightchr", acceptedPolicies: false });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("Accept the Terms and Privacy Policy to create an account.");
  });
});

describe("optional CAPTCHA validation", () => {
  it("normalizes an empty CAPTCHA value so sign-up, recovery, and Google authentication can begin without CAPTCHA configuration", () => {
    const signUp = signUpSchema.safeParse({ name: "Taylor Example", email: "taylor@example.com", password: "eightchr", acceptedPolicies: true, captchaToken: "" });
    const recovery = forgotPasswordSchema.safeParse({ email: "taylor@example.com", captchaToken: "" });
    const google = googleAuthStartSchema.safeParse({ intent: "sign-up", acceptedPolicies: true, captchaToken: "" });

    expect(signUp.success).toBe(true);
    expect(recovery.success).toBe(true);
    expect(google.success).toBe(true);
    if (google.success) expect(google.data.captchaToken).toBeUndefined();
  });
});
