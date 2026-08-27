import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AWS_REGION: z.string().min(1).optional(),
  AGENTPROOF_ENVIRONMENT: z.string().min(1).default("development"),
  AGENTPROOF_BETA_MODE: z.enum(["true", "false"]).default("false"),
  AGENTPROOF_BETA_MAX_AGENTS_PER_USER: z.coerce.number().int().positive().default(5),
  AGENTPROOF_BETA_MAX_RUNS_PER_AGENT_PER_DAY: z.coerce.number().int().positive().default(10),
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
  AGENTPROOF_BETA_MODE: process.env.AGENTPROOF_BETA_MODE,
  AGENTPROOF_BETA_MAX_AGENTS_PER_USER: process.env.AGENTPROOF_BETA_MAX_AGENTS_PER_USER,
  AGENTPROOF_BETA_MAX_RUNS_PER_AGENT_PER_DAY: process.env.AGENTPROOF_BETA_MAX_RUNS_PER_AGENT_PER_DAY,
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

export function requireEnv<T extends keyof typeof env>(name: T): NonNullable<(typeof env)[T]> {
  const value = env[name];

  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value as NonNullable<(typeof env)[T]>;
}
