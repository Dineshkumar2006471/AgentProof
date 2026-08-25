import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { requireEnv } from "@/lib/env";

let client: SQSClient | undefined;

export function getSqs() {
  client ??= new SQSClient({ region: requireEnv("AWS_REGION") });
  return client;
}

export async function enqueueVerification(runId: string) {
  return getSqs().send(new SendMessageCommand({
    QueueUrl: requireEnv("AGENTPROOF_VERIFICATION_QUEUE_URL"),
    MessageBody: JSON.stringify({ runId }),
    MessageAttributes: {
      eventType: { DataType: "String", StringValue: "verification.requested" }
    }
  }));
}
