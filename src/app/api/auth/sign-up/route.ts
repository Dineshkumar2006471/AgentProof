import { ApiError, handleApiError, jsonOk } from "@/lib/api";
import { signUp } from "@/lib/auth/cognito";
import { signUpSchema } from "@/lib/validation";
import { enforceRateLimit, rateLimits, requestIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { policyVersion } from "@/lib/policies";
import { recordPolicyAcceptance } from "@/lib/aws/dynamodb";

export async function POST(request: Request) {
  try {
    const input = signUpSchema.parse(await request.json());
    await enforceRateLimit(request, rateLimits.signUp, input.email.toLowerCase());
    await verifyTurnstile(input.captchaToken, requestIp(request));
    const result = await signUp(input);
    if (!result.UserSub) throw new ApiError(503, "Account creation is temporarily unavailable. Please try again later.");
    await recordPolicyAcceptance(result.UserSub, { version: policyVersion, acceptedAt: new Date().toISOString() });
    return jsonOk({ userSub: result.UserSub, confirmationRequired: !result.UserConfirmed }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
