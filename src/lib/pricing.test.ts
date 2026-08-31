import { describe, expect, it } from "vitest";
import { getPricingPlan, pricingPlans } from "@/lib/pricing";

describe("beta pricing", () => {
  it("keeps the founder-friendly prices in one shared definition", () => {
    expect(getPricingPlan("builder")?.price).toBe("₹199 / mo");
    expect(getPricingPlan("agency")?.price).toBe("₹399 / mo");
    expect(getPricingPlan("pay_per_verification")?.price).toBe("₹49");
  });

  it("keeps beta quotas intentionally small", () => {
    expect(getPricingPlan("free")?.quota).toBe("1 agent / 5 tests per run");
    expect(getPricingPlan("builder")?.quota).toBe("3 agents / 25 tests per month");
    expect(getPricingPlan("agency")?.quota).toBe("10 agents / 100 tests per month");
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
