import { requireEnv } from "@/lib/env";

export function getSqs() {
  requireEnv("AWS_REGION");
  requireEnv("AGENTPROOF_VERIFICATION_QUEUE_URL");
  throw new Error("SQS client is not installed until AWS wiring begins.");
}
