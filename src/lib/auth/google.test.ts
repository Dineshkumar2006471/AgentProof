import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnvironment = { ...process.env };

function restoreEnvironment() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnvironment)) delete process.env[key];
  }
  Object.assign(process.env, originalEnvironment);
}

afterEach(() => {
  restoreEnvironment();
  vi.resetModules();
});

describe("Google OAuth configuration", () => {
  it("keeps Google sign-in disabled unless the public flag and Cognito domain are present", async () => {
    process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED = "false";
    process.env.COGNITO_DOMAIN = "https://agentproof-production-899640267626.auth.ap-south-1.amazoncognito.com";
    process.env.COGNITO_CLIENT_ID = "client-id";
    const { googleSignInEnabled } = await import("@/lib/auth/google");

    expect(googleSignInEnabled()).toBe(false);
  });

  it("builds a Cognito authorization-code URL without exposing a Google secret", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://agent-proof.dev";
    process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED = "true";
    process.env.COGNITO_DOMAIN = "https://agentproof-production-899640267626.auth.ap-south-1.amazoncognito.com";
    process.env.COGNITO_CLIENT_ID = "client-id";
    const { googleAuthorizationUrl } = await import("@/lib/auth/google");

    const url = new URL(googleAuthorizationUrl("state-value"));
    expect(url.origin).toBe("https://agentproof-production-899640267626.auth.ap-south-1.amazoncognito.com");
    expect(url.pathname).toBe("/oauth2/authorize");
    expect(url.searchParams.get("identity_provider")).toBe("Google");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("redirect_uri")).toBe("https://agent-proof.dev/api/auth/google/callback");
    expect(url.searchParams.get("state")).toBe("state-value");
  });

  it("only allows internal post-authentication destinations", async () => {
    const { safeInternalPath } = await import("@/lib/auth/google");

    expect(safeInternalPath("/agents/new")).toBe("/agents/new");
    expect(safeInternalPath("https://attacker.example")).toBe("/dashboard");
    expect(safeInternalPath("//attacker.example")).toBe("/dashboard");
  });
});
