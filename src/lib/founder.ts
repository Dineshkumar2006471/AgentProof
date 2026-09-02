import { ApiError } from "@/lib/api";
import { env } from "@/lib/env";

export function isFounder(userId: string) {
  return (env.AGENTPROOF_FOUNDER_USER_IDS ?? "").split(",").map((value) => value.trim()).filter(Boolean).includes(userId);
}

export function requireFounder(userId: string) {
  if (!isFounder(userId)) throw new ApiError(404, "Page not found.");
}
