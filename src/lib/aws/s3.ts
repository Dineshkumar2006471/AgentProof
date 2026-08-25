import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "@/lib/env";

let client: S3Client | undefined;

function getClient() {
  client ??= new S3Client({ region: requireEnv("AWS_REGION") });
  return client;
}

export async function putRawResponse(key: string, body: string) {
  await getClient().send(new PutObjectCommand({
    Bucket: requireEnv("AGENTPROOF_REPORTS_BUCKET"),
    Key: key,
    Body: body,
    ContentType: "application/json",
    ServerSideEncryption: "AES256"
  }));
  return key;
}
