import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api";
import { env, requireEnv } from "@/lib/env";
import { appUrl } from "@/lib/auth/session";

export const googleOauthCookies = {
  state: "agentproof-google-oauth-state",
  intent: "agentproof-google-oauth-intent",
  next: "agentproof-google-oauth-next",
  policyAccepted: "agentproof-google-oauth-policy-accepted"
} as const;

export type GoogleAuthIntent = "sign-in" | "sign-up";

export function safeInternalPath(value: string | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export function googleSignInEnabled() {
  return env.NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED === "true" && Boolean(env.COGNITO_DOMAIN && env.COGNITO_CLIENT_ID);
}

export function googleCallbackUrl() {
  return new URL("/api/auth/google/callback", appUrl()).toString();
}

function cognitoDomain() {
  if (!googleSignInEnabled()) throw new ApiError(503, "Google sign-in is not configured yet.");
  return requireEnv("COGNITO_DOMAIN").replace(/\/$/, "");
}

export function createGoogleOauthState() {
  return randomBytes(32).toString("base64url");
}

export function googleAuthorizationUrl(state: string) {
  const url = new URL(`${cognitoDomain()}/oauth2/authorize`);
  url.searchParams.set("identity_provider", "Google");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requireEnv("COGNITO_CLIENT_ID"));
  url.searchParams.set("redirect_uri", googleCallbackUrl());
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  return url.toString();
}

type CognitoTokenResponse = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

export async function exchangeGoogleAuthorizationCode(code: string): Promise<AuthenticationResultType> {
  const response = await fetch(`${cognitoDomain()}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: requireEnv("COGNITO_CLIENT_ID"),
      code,
      redirect_uri: googleCallbackUrl()
    }),
    cache: "no-store"
  }).catch(() => null);

  if (!response?.ok) throw new ApiError(502, "Google sign-in could not be completed. Please try again.");

  const payload = await response.json().catch(() => ({})) as CognitoTokenResponse;
  if (!payload.access_token || !payload.id_token) {
    throw new ApiError(502, "Google sign-in did not return a complete session. Please try again.");
  }

  return {
    AccessToken: payload.access_token,
    IdToken: payload.id_token,
    RefreshToken: payload.refresh_token,
    ExpiresIn: payload.expires_in
  };
}
