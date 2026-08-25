import { env, requireEnv } from "@/lib/env";

export function getOpenAI() {
  requireEnv("OPENAI_API_KEY");
  throw new Error("OpenAI client is not installed until LLM wiring begins.");
}

export function getOpenAIModel() {
  return env.OPENAI_MODEL;
}
