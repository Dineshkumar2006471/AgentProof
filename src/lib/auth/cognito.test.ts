import { afterEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  process.env.AWS_REGION = "ap-south-1";
  process.env.COGNITO_CLIENT_ID = "test-client-id";
});

import { signIn } from "@/lib/auth/cognito";

describe("Cognito public app-client transport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("preserves Cognito authentication errors without requiring AWS credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      __type: "NotAuthorizedException",
      message: "Incorrect username or password."
    }), { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(signIn("nobody@example.com", "invalid-password")).rejects.toMatchObject({
      name: "NotAuthorizedException",
      message: "Incorrect username or password."
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
