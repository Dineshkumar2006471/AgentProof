import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { awsRegion, requireEnv } from "@/lib/env";

let client: SQSClient | undefined;

export function getSqs() {
  client ??= new SQSClient({ region: awsRegion() });
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
