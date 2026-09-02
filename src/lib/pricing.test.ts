import { describe, expect, it } from "vitest";
import { entitlementForPlan, getPricingPlan, pricingPlans, resolveEntitledPlan } from "@/lib/pricing";

describe("beta pricing", () => {
  it("keeps the founder-friendly prices in one shared definition", () => {
    expect(getPricingPlan("builder")?.price).toBe("₹199 / mo");
    expect(getPricingPlan("agency")?.price).toBe("₹499 / mo");
    expect(getPricingPlan("pay_per_verification")?.price).toBe("₹49");
  });

  it("keeps beta quotas intentionally small", () => {
    expect(getPricingPlan("free")?.quota).toBe("1 agent / 15 tests per month / 2 verification runs per month");
    expect(getPricingPlan("builder")?.quota).toBe("3 agents / 100 tests per month / 10 verification runs per month");
    expect(getPricingPlan("agency")?.quota).toBe("10 agents / 500 tests per month / 50 verification runs per month");
    expect(getPricingPlan("pay_per_verification")?.quota).toBe("1 verification run / up to 25 tests");
  });

  it("enforces the published capacity and honors only activated paid plans", () => {
    expect(entitlementForPlan("free")).toMatchObject({ maxAgents: 1, monthlyTestLimit: 15, monthlyRunLimit: 2 });
    expect(entitlementForPlan("builder")).toMatchObject({ maxAgents: 3, monthlyTestLimit: 100, monthlyRunLimit: 10 });
    expect(entitlementForPlan("agency")).toMatchObject({ maxAgents: 10, monthlyTestLimit: 500, monthlyRunLimit: 50 });
    expect(entitlementForPlan("pay_per_verification")).toMatchObject({ maxAgents: 1, maxTestsPerRun: 25 });
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
