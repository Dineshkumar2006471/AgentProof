import { ApiError } from "@/lib/api";
import { env } from "@/lib/env";

type TurnstileResult = { success?: boolean };

export function turnstileRequired() {
  return env.AGENTPROOF_ENVIRONMENT === "production";
}

export async function verifyTurnstile(token: string | undefined, remoteIp?: string) {
  if (!turnstileRequired()) return;
  if (!env.AGENTPROOF_TURNSTILE_SECRET_KEY) {
    throw new ApiError(503, "Account protection is not configured. Please try again later.");
  }
  if (!token) throw new ApiError(422, "Complete the security check before continuing.");

  const body = new URLSearchParams({
    secret: env.AGENTPROOF_TURNSTILE_SECRET_KEY,
    response: token,
    ...(remoteIp ? { remoteip: remoteIp } : {})
  });
  let result: TurnstileResult;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store"
    });
    result = await response.json() as TurnstileResult;
  } catch {
    throw new ApiError(503, "Account protection is temporarily unavailable. Please try again later.");
  }
  if (!result.success) throw new ApiError(422, "Complete the security check before continuing.");
}
