import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AWS_REGION: z.string().min(1).optional(),
  AGENTPROOF_ENVIRONMENT: z.string().min(1).default("development"),
  AGENTPROOF_DYNAMODB_TABLE: z.string().min(1).optional(),
  AGENTPROOF_REPORTS_BUCKET: z.string().min(1).optional(),
  AGENTPROOF_VERIFICATION_QUEUE_URL: z.string().min(1).optional(),
  COGNITO_USER_POOL_ID: z.string().min(1).optional(),
  COGNITO_CLIENT_ID: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini"),
  DODO_API_KEY: z.string().min(1).optional(),
  DODO_WEBHOOK_SECRET: z.string().min(1).optional(),
  SARVAM_API_KEY: z.string().min(1).optional()
});

export const env = serverEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  AWS_REGION: process.env.AWS_REGION,
  AGENTPROOF_ENVIRONMENT: process.env.AGENTPROOF_ENVIRONMENT,
  AGENTPROOF_DYNAMODB_TABLE: process.env.AGENTPROOF_DYNAMODB_TABLE,
  AGENTPROOF_REPORTS_BUCKET: process.env.AGENTPROOF_REPORTS_BUCKET,
  AGENTPROOF_VERIFICATION_QUEUE_URL:
    process.env.AGENTPROOF_VERIFICATION_QUEUE_URL,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  DODO_API_KEY: process.env.DODO_API_KEY,
  DODO_WEBHOOK_SECRET: process.env.DODO_WEBHOOK_SECRET,
  SARVAM_API_KEY: process.env.SARVAM_API_KEY
});

export function requireEnv(name: keyof typeof env) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
