import { createHash } from "node:crypto";
import { ApiError } from "@/lib/api";
import { consumeRateLimit } from "@/lib/aws/dynamodb";

export type RateLimit = { scope: string; limit: number; windowSeconds: number };

export const rateLimits = {
  signUp: { scope: "auth-sign-up", limit: 5, windowSeconds: 60 * 60 },
  signIn: { scope: "auth-sign-in", limit: 10, windowSeconds: 15 * 60 },
  passwordReset: { scope: "auth-password-reset", limit: 3, windowSeconds: 60 * 60 },
  aiGeneration: { scope: "ai-generation", limit: 12, windowSeconds: 60 * 60 },
  verificationStart: { scope: "verification-start", limit: 20, windowSeconds: 60 * 60 },
  export: { scope: "report-export", limit: 20, windowSeconds: 60 * 60 },
  checkout: { scope: "checkout", limit: 5, windowSeconds: 15 * 60 }
} satisfies Record<string, RateLimit>;

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export function rateLimitSubject(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export async function enforceRateLimit(request: Request, limit: RateLimit, subject?: string) {
  const identifier = rateLimitSubject(subject ? `${subject}:${requestIp(request)}` : requestIp(request));
  const allowed = await consumeRateLimit({ ...limit, subject: identifier });
  if (!allowed) throw new ApiError(429, "Too many requests. Please try again later.");
}
