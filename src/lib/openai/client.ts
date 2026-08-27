import { env, requireEnv } from "@/lib/env";
import OpenAI from "openai";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

let clientPromise: Promise<OpenAI> | undefined;

async function resolveApiKey() {
  if (env.OPENAI_API_KEY) return env.OPENAI_API_KEY;
  const secretArn = env.OPENAI_SECRET_ARN;
  if (!secretArn) return requireEnv("OPENAI_API_KEY");
  const secret = await new SecretsManagerClient({ region: requireEnv("AWS_REGION") }).send(
    new GetSecretValueCommand({ SecretId: secretArn })
  );
  const value = secret.SecretString?.trim();
  if (!value) throw new Error("OpenAI secret is empty.");
  try {
    const parsed = JSON.parse(value) as { OPENAI_API_KEY?: string };
    if (parsed.OPENAI_API_KEY) return parsed.OPENAI_API_KEY;
  } catch {
    return value;
  }
  throw new Error("OpenAI secret does not contain OPENAI_API_KEY.");
}

export async function getOpenAI() {
  clientPromise ??= resolveApiKey().then((apiKey) => new OpenAI({ apiKey }));
  return clientPromise;
}

export function getOpenAIModel() {
  return env.OPENAI_MODEL;
}
