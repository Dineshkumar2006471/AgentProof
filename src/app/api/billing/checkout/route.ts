import { checkoutSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await request.json());

    return jsonOk({
      plan: input.plan,
      checkoutStatus: "dodo_stub_requires_credentials"
    });
  } catch (error) {
    return handleApiError(error);
  }
}
