import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleAuthorizationCode, googleOauthCookies, safeInternalPath } from "@/lib/auth/google";
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
  const url = new URL("/auth/sign-in", request.url);
  url.searchParams.set("oauth_error", reason);
  const response = NextResponse.redirect(url);
  clearGoogleOauthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const providerError = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get(googleOauthCookies.state)?.value;
  const intent = request.cookies.get(googleOauthCookies.intent)?.value;
  const next = request.cookies.get(googleOauthCookies.next)?.value;
  const policyAccepted = request.cookies.get(googleOauthCookies.policyAccepted)?.value === "true";

  if (providerError) return failedGoogleSignIn(request, "cancelled");
  if (!code || !state || !expectedState || state !== expectedState || (intent !== "sign-in" && intent !== "sign-up")) {
    return failedGoogleSignIn(request, "invalid");
  }

  try {
    const result = await exchangeGoogleAuthorizationCode(code);
    const user = await userFromAuthenticationResult(result);

    if (intent === "sign-up") {
      if (!policyAccepted) return failedGoogleSignIn(request, "invalid");
      await recordPolicyAcceptance(user.sub, { version: policyVersion, acceptedAt: new Date().toISOString() });
    }

    const response = NextResponse.redirect(new URL(safeInternalPath(next), appUrl()));
    setSessionOnResponse(response, result);
    clearGoogleOauthCookies(response);
    return response;
  } catch {
    return failedGoogleSignIn(request, "failed");
  }
}
