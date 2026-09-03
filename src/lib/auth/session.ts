import { CognitoJwtVerifier } from "aws-jwt-verify";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { env, requireEnv } from "@/lib/env";
import { refreshSession } from "@/lib/auth/cognito";

const cookieNames = {
  access: "agentproof-access-token",
  id: "agentproof-id-token",
  refresh: "agentproof-refresh-token"
};

function isProduction() {
  return process.env.NODE_ENV === "production";
}

const accessTokenVerifier = () => CognitoJwtVerifier.create({
  userPoolId: requireEnv("COGNITO_USER_POOL_ID"),
  tokenUse: "access",
  clientId: requireEnv("COGNITO_CLIENT_ID")
});

const idTokenVerifier = () => CognitoJwtVerifier.create({
  userPoolId: requireEnv("COGNITO_USER_POOL_ID"),
  tokenUse: "id",
  clientId: requireEnv("COGNITO_CLIENT_ID")
});

export type AuthenticatedUser = {
  sub: string;
  username?: string;
  name?: string;
  email?: string;
};

type CookieWriter = Pick<NextResponse["cookies"], "set">;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/"
  };
}

function writeSessionCookies(store: CookieWriter, result: AuthenticationResultType) {
  const common = sessionCookieOptions();
  const accessMaxAge = result.ExpiresIn ?? 3600;

  if (result.AccessToken) store.set(cookieNames.access, result.AccessToken, { ...common, maxAge: accessMaxAge });
  if (result.IdToken) store.set(cookieNames.id, result.IdToken, { ...common, maxAge: accessMaxAge });
  if (result.RefreshToken) store.set(cookieNames.refresh, result.RefreshToken, { ...common, maxAge: 60 * 60 * 24 * 30 });
}

export async function setSession(result: AuthenticationResultType) {
  const store = await cookies();
  writeSessionCookies(store, result);
}

export function setSessionOnResponse(response: NextResponse, result: AuthenticationResultType) {
  writeSessionCookies(response.cookies, result);
}

export async function clearSession() {
  const store = await cookies();
  for (const name of Object.values(cookieNames)) {
    store.set(name, "", { httpOnly: true, secure: isProduction(), sameSite: "lax", path: "/", maxAge: 0 });
  }
}

async function accessToken() {
  return (await cookies()).get(cookieNames.access)?.value;
}

async function identityClaims() {
  const token = (await cookies()).get(cookieNames.id)?.value;
  if (!token) return {};

  try {
    const payload = await idTokenVerifier().verify(token);
    return {
      name: typeof payload.name === "string" ? payload.name : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined
    };
  } catch {
    return {};
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = await accessToken();
  if (!token) return null;

  try {
    const payload = await accessTokenVerifier().verify(token);
    return { sub: payload.sub, username: payload.username, ...(await identityClaims()) };
  } catch {
    const refreshToken = (await cookies()).get(cookieNames.refresh)?.value;
    if (!refreshToken) return null;
    const refreshed = await refreshSession(refreshToken).catch(() => null);
    if (!refreshed?.AccessToken) {
      await clearSession();
      return null;
    }
    await setSession(refreshed);
    const payload = await accessTokenVerifier().verify(refreshed.AccessToken);
    return { sub: payload.sub, username: payload.username, ...(await identityClaims()) };
  }
}

export async function getAccessToken() {
  return accessToken();
}

export async function userFromAuthenticationResult(result: AuthenticationResultType): Promise<AuthenticatedUser> {
  if (!result.AccessToken || !result.IdToken) throw new Error("Cognito did not return a complete session.");

  const [accessPayload, idPayload] = await Promise.all([
    accessTokenVerifier().verify(result.AccessToken),
    idTokenVerifier().verify(result.IdToken)
  ]);

  return {
    sub: accessPayload.sub,
    username: accessPayload.username,
    name: typeof idPayload.name === "string" ? idPayload.name : undefined,
    email: typeof idPayload.email === "string" ? idPayload.email : undefined
  };
}

export function appUrl() {
  return env.NEXT_PUBLIC_APP_URL;
}
