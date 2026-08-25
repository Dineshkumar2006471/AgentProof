import { requireEnv } from "@/lib/env";

export function getDynamoDb() {
  requireEnv("AWS_REGION");
  requireEnv("AGENTPROOF_DYNAMODB_TABLE");
  throw new Error("DynamoDB client is not installed until AWS wiring begins.");
}
