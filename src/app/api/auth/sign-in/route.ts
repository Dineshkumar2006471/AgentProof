import { handleApiError, jsonOk } from "@/lib/api";
import { signIn } from "@/lib/auth/cognito";
import { setSession } from "@/lib/auth/session";
import { signInSchema } from "@/lib/validation";
import { enforceRateLimit, rateLimits } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const input = signInSchema.parse(await request.json());
    await enforceRateLimit(request, rateLimits.signIn, input.email.toLowerCase());
    const result = await signIn(input.email, input.password);
    await setSession(result);
    return jsonOk({ authenticated: true });
  } catch (error) {
    return handleApiError(error);
  }
}
