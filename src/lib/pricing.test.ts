import { describe, expect, it } from "vitest";
import { entitlementForPlan, getPricingPlan, pricingPlans, resolveEntitledPlan } from "@/lib/pricing";

describe("beta pricing", () => {
  it("keeps the founder-friendly prices in one shared definition", () => {
    expect(getPricingPlan("builder")?.price).toBe("₹199 / mo");
    expect(getPricingPlan("agency")?.price).toBe("₹399 / mo");
    expect(getPricingPlan("pay_per_verification")?.price).toBe("₹49");
  });

  it("keeps beta quotas intentionally small", () => {
    expect(getPricingPlan("free")?.quota).toBe("2 agents / open beta run limits");
    expect(getPricingPlan("builder")?.quota).toBe("3 agents / 25 tests per month");
    expect(getPricingPlan("agency")?.quota).toBe("10 agents / 100 tests per month");
  });

  it("enforces two agents for free accounts and honors only activated paid plans", () => {
    expect(entitlementForPlan("free").maxAgents).toBe(2);
    expect(entitlementForPlan("builder").monthlyTestLimit).toBe(25);
    expect(entitlementForPlan("agency").monthlyTestLimit).toBe(100);
    expect(entitlementForPlan("pay_per_verification").consumesOneRunCredit).toBe(true);
    expect(resolveEntitledPlan(null)).toBe("free");
    expect(resolveEntitledPlan({ plan: "builder", billingStatus: "paid" })).toBe("free");
    expect(resolveEntitledPlan({ plan: "builder", billingStatus: "active" })).toBe("builder");
    expect(resolveEntitledPlan({ plan: "agency", billingStatus: "active" })).toBe("agency");
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
