import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Authentication required.");
  return user;
}
