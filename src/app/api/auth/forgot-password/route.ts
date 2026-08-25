import { handleApiError, jsonOk } from "@/lib/api";
import { forgotPassword } from "@/lib/auth/cognito";
import { forgotPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    await forgotPassword(input.email);
    return jsonOk({ resetRequired: true });
  } catch (error) {
    return handleApiError(error);
  }
}
