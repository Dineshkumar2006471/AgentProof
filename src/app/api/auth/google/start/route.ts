import { NextResponse } from "next/server";
import { handleApiError, jsonOk, ApiError } from "@/lib/api";
import { createGoogleOauthState, googleAuthorizationUrl, googleOauthCookies, safeInternalPath } from "@/lib/auth/google";
import { googleAuthStartSchema } from "@/lib/validation";
import { enforceRateLimit, rateLimits, requestIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60
  };
}

export async function POST(request: Request) {
  try {
    const input = googleAuthStartSchema.parse(await request.json());
    if (input.intent === "sign-up" && input.acceptedPolicies !== true) {
      throw new ApiError(400, "Accept the Terms and Privacy Policy to continue with Google.");
    }

    await enforceRateLimit(request, input.intent === "sign-up" ? rateLimits.signUp : rateLimits.signIn, requestIp(request));
    if (input.intent === "sign-up") await verifyTurnstile(input.captchaToken, requestIp(request));

    const state = createGoogleOauthState();
    const response = jsonOk({ authorizeUrl: googleAuthorizationUrl(state) });
    const options = cookieOptions();
    response.cookies.set(googleOauthCookies.state, state, options);
    response.cookies.set(googleOauthCookies.intent, input.intent, options);
    response.cookies.set(googleOauthCookies.next, safeInternalPath(input.next), options);
    response.cookies.set(googleOauthCookies.policyAccepted, input.intent === "sign-up" ? "true" : "false", options);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
