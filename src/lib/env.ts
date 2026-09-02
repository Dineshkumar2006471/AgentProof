import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_POSTHOG_PROJECT_URL: z.string().url().optional(),
  AWS_REGION: z.string().min(1).optional(),
  AGENTPROOF_ENVIRONMENT: z.string().min(1).default("development"),
  AGENTPROOF_DAILY_RUN_LIMIT_PER_AGENT: z.coerce.number().int().positive().default(10),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  AGENTPROOF_TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  AGENTPROOF_FOUNDER_USER_IDS: z.string().optional(),
  AGENTPROOF_DYNAMODB_TABLE: z.string().min(1).optional(),
  AGENTPROOF_REPORTS_BUCKET: z.string().min(1).optional(),
  AGENTPROOF_VERIFICATION_QUEUE_URL: z.string().min(1).optional(),
  COGNITO_USER_POOL_ID: z.string().min(1).optional(),
  COGNITO_CLIENT_ID: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_SECRET_ARN: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini"),
  DODO_PAYMENTS_API_KEY: z.string().min(1).optional(),
  DODO_PAYMENTS_WEBHOOK_KEY: z.string().min(1).optional(),
  DODO_PAYMENTS_ENVIRONMENT: z.enum(["test_mode", "live_mode"]).default("test_mode"),
  DODO_CHECKOUT_ENABLED: z.enum(["true", "false"]).default("false"),
  DODO_BUILDER_PRODUCT_ID: z.string().min(1).optional(),
  DODO_AGENCY_PRODUCT_ID: z.string().min(1).optional(),
  DODO_ONE_RUN_PRODUCT_ID: z.string().min(1).optional(),
  SARVAM_API_KEY: z.string().min(1).optional()
});

export const env = serverEnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_POSTHOG_PROJECT_URL: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_URL,
  AWS_REGION: process.env.AWS_REGION,
  AGENTPROOF_ENVIRONMENT: process.env.AGENTPROOF_ENVIRONMENT,
  AGENTPROOF_DAILY_RUN_LIMIT_PER_AGENT: process.env.AGENTPROOF_DAILY_RUN_LIMIT_PER_AGENT,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  AGENTPROOF_TURNSTILE_SECRET_KEY: process.env.AGENTPROOF_TURNSTILE_SECRET_KEY,
  AGENTPROOF_FOUNDER_USER_IDS: process.env.AGENTPROOF_FOUNDER_USER_IDS,
  AGENTPROOF_DYNAMODB_TABLE: process.env.AGENTPROOF_DYNAMODB_TABLE,
  AGENTPROOF_REPORTS_BUCKET: process.env.AGENTPROOF_REPORTS_BUCKET,
  AGENTPROOF_VERIFICATION_QUEUE_URL:
    process.env.AGENTPROOF_VERIFICATION_QUEUE_URL,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_SECRET_ARN: process.env.OPENAI_SECRET_ARN,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY,
  DODO_PAYMENTS_WEBHOOK_KEY: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  DODO_PAYMENTS_ENVIRONMENT: process.env.DODO_PAYMENTS_ENVIRONMENT,
  DODO_CHECKOUT_ENABLED: process.env.DODO_CHECKOUT_ENABLED,
  DODO_BUILDER_PRODUCT_ID: process.env.DODO_BUILDER_PRODUCT_ID,
  DODO_AGENCY_PRODUCT_ID: process.env.DODO_AGENCY_PRODUCT_ID,
  DODO_ONE_RUN_PRODUCT_ID: process.env.DODO_ONE_RUN_PRODUCT_ID,
  SARVAM_API_KEY: process.env.SARVAM_API_KEY
});

export function requireEnv<T extends keyof typeof env>(name: T): NonNullable<(typeof env)[T]> {
  const value = env[name];

  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value as NonNullable<(typeof env)[T]>;
}

export function awsRegion() {
  return env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "ap-south-1";
}
