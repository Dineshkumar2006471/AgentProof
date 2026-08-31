import { describe, expect, it } from "vitest";
import { getPricingPlan, pricingPlans } from "@/lib/pricing";

describe("beta pricing", () => {
  it("keeps the founder-friendly prices in one shared definition", () => {
    expect(getPricingPlan("builder")?.price).toBe("₹199 / mo");
    expect(getPricingPlan("agency")?.price).toBe("₹399 / mo");
    expect(getPricingPlan("pay_per_verification")?.price).toBe("₹49");
  });

  it("includes the free plan and all paid beta options", () => {
    expect(pricingPlans.map((plan) => plan.id)).toEqual([
      "free",
      "builder",
      "agency",
      "pay_per_verification"
    ]);
  });
});
