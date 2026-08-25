import { handleApiError, jsonOk } from "@/lib/api";
import { confirmSignUp } from "@/lib/auth/cognito";
import { confirmSignUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = confirmSignUpSchema.parse(await request.json());
    await confirmSignUp(input.email, input.code);
    return jsonOk({ confirmed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
