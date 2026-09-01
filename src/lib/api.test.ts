import { describe, expect, it } from "vitest";
import { handleApiError } from "@/lib/api";

function cognitoError(name: string) {
  const error = new Error("Cognito rejected the request.");
  error.name = name;
  return error;
}

describe("authentication API errors", () => {
  it("explains the simplified password minimum", async () => {
    const response = handleApiError(cognitoError("InvalidPasswordException"));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({ error: "Use at least 8 characters." });
  });

  it("directs existing accounts to sign in or reset their password", async () => {
    const response = handleApiError(cognitoError("UsernameExistsException"));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "An account already exists for this email. Sign in or reset your password." });
  });
});
