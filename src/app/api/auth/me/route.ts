import { handleApiError, jsonOk } from "@/lib/api";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  try {
    return jsonOk({ user: await requireUser() });
  } catch (error) {
    return handleApiError(error);
  }
}
