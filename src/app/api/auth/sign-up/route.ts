import { handleApiError, jsonOk } from "@/lib/api";
import { signUp } from "@/lib/auth/cognito";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const input = signUpSchema.parse(await request.json());
    const result = await signUp(input);
    return jsonOk({ userSub: result.UserSub, confirmationRequired: !result.UserConfirmed }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
