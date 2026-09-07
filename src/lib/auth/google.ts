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
  const hasDependencies = Boolean(env.COGNITO_DOMAIN && env.COGNITO_CLIENT_ID);
  if (!hasDependencies) return false;
  
  const isLocal = env.NEXT_PUBLIC_APP_URL?.includes("localhost") || env.NEXT_PUBLIC_APP_URL?.includes("127.0.0.1");
  if (isLocal) return true;
  
  return env.NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED === "true";
}

export function googleCallbackUrl(request?: Request | { headers: Headers; url?: string }) {
  return new URL("/api/auth/google/callback", appUrl(request)).toString();
}

function cognitoDomain() {
  if (!googleSignInEnabled()) throw new ApiError(503, "Google sign-in is not configured yet.");
  return requireEnv("COGNITO_DOMAIN").replace(/\/$/, "");
}

export function createGoogleOauthState() {
  return randomBytes(32).toString("base64url");
}

export function googleAuthorizationUrl(state: string, request?: Request | { headers: Headers; url?: string }) {
  const url = new URL(`${cognitoDomain()}/oauth2/authorize`);
  url.searchParams.set("identity_provider", "Google");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", requireEnv("COGNITO_CLIENT_ID"));
  url.searchParams.set("redirect_uri", googleCallbackUrl(request));
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export function cognitoLogoutUrl(request?: Request | { headers: Headers; url?: string }) {
  if (!env.COGNITO_DOMAIN || !env.COGNITO_CLIENT_ID) return null;
  const domain = env.COGNITO_DOMAIN.replace(/\/$/, "");
  const clientId = env.COGNITO_CLIENT_ID;
  const logoutUri = appUrl(request);
  const url = new URL(`${domain}/logout`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("logout_uri", logoutUri);
  return url.toString();
}

type CognitoTokenResponse = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

export async function exchangeGoogleAuthorizationCode(code: string, request?: Request | { headers: Headers; url?: string }): Promise<AuthenticationResultType> {
  const response = await fetch(`${cognitoDomain()}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: requireEnv("COGNITO_CLIENT_ID"),
      code,
      redirect_uri: googleCallbackUrl(request)
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
