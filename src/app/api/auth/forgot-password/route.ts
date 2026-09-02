import { handleApiError, jsonOk } from "@/lib/api";
import { forgotPassword } from "@/lib/auth/cognito";
import { forgotPasswordSchema } from "@/lib/validation";
import { enforceRateLimit, rateLimits, requestIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(request: Request) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    await enforceRateLimit(request, rateLimits.passwordReset, input.email.toLowerCase());
    await verifyTurnstile(input.captchaToken, requestIp(request));
    await forgotPassword(input.email);
    return jsonOk({ resetRequired: true });
  } catch (error) {
    return handleApiError(error);
  }
}
