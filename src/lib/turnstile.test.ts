import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnvironment = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnvironment)) delete process.env[key];
  }
  Object.assign(process.env, originalEnvironment);
  vi.resetModules();
});

describe("Turnstile configuration", () => {
  it("does not block production registration when CAPTCHA keys have not been configured", async () => {
    process.env.AGENTPROOF_ENVIRONMENT = "production";
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.AGENTPROOF_TURNSTILE_SECRET_KEY;

    const { turnstileRequired } = await import("@/lib/turnstile");

    expect(turnstileRequired()).toBe(false);
  });

  it("enforces CAPTCHA only after both required keys are configured", async () => {
    process.env.AGENTPROOF_ENVIRONMENT = "production";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.AGENTPROOF_TURNSTILE_SECRET_KEY = "server-secret";

    const { turnstileRequired } = await import("@/lib/turnstile");

    expect(turnstileRequired()).toBe(true);
  });
});
