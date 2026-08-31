import { jsonOk } from "@/lib/api";
import { pricingPlans } from "@/lib/pricing";

export async function GET() {
  return jsonOk({ plans: pricingPlans });
}
