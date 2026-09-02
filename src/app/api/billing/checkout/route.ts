import { checkoutSchema } from "@/lib/validation";
import { ApiError, handleApiError, jsonOk } from "@/lib/api";
import { requireUser } from "@/lib/auth/require-user";
import { appUrl } from "@/lib/auth/session";
import { dodoCheckoutEnabled, dodoProductId, getDodoClient, dodoUpstreamError } from "@/lib/dodo";
import { enforceRateLimit, rateLimits } from "@/lib/rate-limit";
import type { PricingPlanId } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await request.json());
    const user = await requireUser();
    if (!dodoCheckoutEnabled()) {
      throw new ApiError(503, "Payment checkout is not available yet.");
    }
    await enforceRateLimit(request, rateLimits.checkout, user.sub);

    const plan = input.plan as Exclude<PricingPlanId, "free">;
    const email = user.email ?? user.username;
    if (!email || !email.includes("@")) throw new ApiError(422, "A verified account email is required for checkout.");

    let session;
    try {
      session = await getDodoClient({ requireApiKey: true }).checkoutSessions.create({
        product_cart: [{ product_id: dodoProductId(plan), quantity: 1 }],
        customer: { email, name: user.name ?? user.username },
        metadata: { agentproofUserId: user.sub, plan },
        return_url: `${appUrl()}/pricing?checkout=complete`,
        cancel_url: `${appUrl()}/pricing?checkout=cancelled`,
        customization: { theme: "light", show_order_details: true }
      });
    } catch (error) {
      console.error("Dodo checkout request failed", error instanceof Error ? { name: error.name, message: error.message } : { error });
      throw dodoUpstreamError();
    }

    if (!session.checkout_url) throw dodoUpstreamError();

    return jsonOk({
      plan,
      sessionId: session.session_id,
      checkoutUrl: session.checkout_url
    });
  } catch (error) {
    return handleApiError(error);
  }
}
