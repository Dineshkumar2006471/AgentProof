import { describe, expect, it } from "vitest";
import { createAgentSchema, forgotPasswordSchema, googleAuthStartSchema, resetPasswordSchema, signUpSchema } from "@/lib/validation";

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
