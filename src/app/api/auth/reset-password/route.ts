import { handleApiError, jsonOk } from "@/lib/api";
import { confirmForgotPassword } from "@/lib/auth/cognito";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = resetPasswordSchema.parse(await request.json());
    await confirmForgotPassword(input.email, input.code, input.password);
    return jsonOk({ reset: true });
  } catch (error) {
    return handleApiError(error);
  }
}
