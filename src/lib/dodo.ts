import DodoPayments from "dodopayments";
import { ApiError, UpstreamServiceError } from "@/lib/api";
import { env, requireEnv } from "@/lib/env";
import type { PricingPlanId } from "@/lib/pricing";

const productEnvByPlan: Record<Exclude<PricingPlanId, "free">, keyof typeof env> = {
  builder: "DODO_BUILDER_PRODUCT_ID",
  agency: "DODO_AGENCY_PRODUCT_ID",
  pay_per_verification: "DODO_ONE_RUN_PRODUCT_ID"
};

export function dodoCheckoutEnabled(userId: string) {
  if (env.DODO_CHECKOUT_ENABLED !== "true") return false;
  const allowedUsers = (env.DODO_TEST_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowedUsers.includes(userId);
}

export function dodoProductId(plan: Exclude<PricingPlanId, "free">) {
  return String(requireEnv(productEnvByPlan[plan]));
}

export function dodoPlanFromProductId(productId: string | undefined): Exclude<PricingPlanId, "free"> | undefined {
  if (!productId) return undefined;
  const plans: Array<Exclude<PricingPlanId, "free">> = ["builder", "agency", "pay_per_verification"];
  return plans.find((plan) => {
    const configured = env[productEnvByPlan[plan]];
    return configured === productId;
  });
}

export function getDodoClient(options: { requireApiKey?: boolean } = {}) {
  const apiKey = env.DODO_PAYMENTS_API_KEY;
  const webhookKey = env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (options.requireApiKey && !apiKey) throw new ApiError(503, "Payment checkout is not configured.");
  if (!options.requireApiKey && !webhookKey) throw new ApiError(503, "Payment webhooks are not configured.");

  return new DodoPayments({
    bearerToken: apiKey,
    webhookKey,
    environment: env.DODO_PAYMENTS_ENVIRONMENT
  });
}

export function dodoUpstreamError() {
  return new UpstreamServiceError("Payment provider is temporarily unavailable.", "Dodo Payments");
}
