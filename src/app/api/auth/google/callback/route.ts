import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleAuthorizationCode, googleOauthCookies, parseGoogleOauthState, safeInternalPath, type GoogleAuthIntent } from "@/lib/auth/google";
import { appUrl, setSessionOnResponse, userFromAuthenticationResult } from "@/lib/auth/session";
import { policyVersion } from "@/lib/policies";
import { recordPolicyAcceptance } from "@/lib/aws/dynamodb";

function clearGoogleOauthCookies(response: NextResponse) {
  for (const name of Object.values(googleOauthCookies)) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0
    });
  }
}

function failedGoogleSignIn(request: NextRequest, reason: "cancelled" | "invalid" | "failed") {
  const url = new URL("/auth/sign-in", appUrl(request));
  url.searchParams.set("oauth_error", reason);
  const response = NextResponse.redirect(url);
  clearGoogleOauthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const providerError = request.nextUrl.searchParams.get("error");

  if (providerError) return failedGoogleSignIn(request, "cancelled");
  if (!code || !state) return failedGoogleSignIn(request, "invalid");

  const parsedState = parseGoogleOauthState(state);
  const cookieState = request.cookies.get(googleOauthCookies.state)?.value;

  const isStateValid = (cookieState && cookieState === state) || Boolean(parsedState);
  if (!isStateValid) {
    return failedGoogleSignIn(request, "invalid");
  }

  const intent = parsedState?.intent ?? (request.cookies.get(googleOauthCookies.intent)?.value as GoogleAuthIntent);
  const next = parsedState?.next ?? request.cookies.get(googleOauthCookies.next)?.value;
  const policyAccepted = parsedState?.policyAccepted ?? (request.cookies.get(googleOauthCookies.policyAccepted)?.value === "true");

  if (intent !== "sign-in" && intent !== "sign-up") {
    return failedGoogleSignIn(request, "invalid");
  }

  try {
    const result = await exchangeGoogleAuthorizationCode(code, request);
    const user = await userFromAuthenticationResult(result);

    if (intent === "sign-up") {
      if (!policyAccepted) return failedGoogleSignIn(request, "invalid");
      await recordPolicyAcceptance(user.sub, { version: policyVersion, acceptedAt: new Date().toISOString() });
    }

    const response = NextResponse.redirect(new URL(safeInternalPath(next), appUrl(request)));
    setSessionOnResponse(response, result);
    clearGoogleOauthCookies(response);
    return response;
  } catch {
    return failedGoogleSignIn(request, "failed");
  }
}
