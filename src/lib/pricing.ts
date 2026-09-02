export type PricingPlanId = "free" | "builder" | "agency" | "pay_per_verification";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  price: string;
  quota: string;
  maxAgents: number;
  reports: string;
  badge: string;
  support: string;
  cta: string;
  recurring: boolean;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    quota: "2 agents / open beta run limits",
    maxAgents: 2,
    reports: "Public report",
    badge: "—",
    support: "Community",
    cta: "Start free",
    recurring: false
  },
  {
    id: "builder",
    name: "Builder",
    price: "₹199 / mo",
    quota: "3 agents / 25 tests per month",
    maxAgents: 3,
    reports: "Private + public",
    badge: "Included",
    support: "Priority",
    cta: "Start builder",
    recurring: true
  },
  {
    id: "agency",
    name: "Agency",
    price: "₹399 / mo",
    quota: "10 agents / 100 tests per month",
    maxAgents: 10,
    reports: "White-label reports",
    badge: "Included",
    support: "Dedicated",
    cta: "Start agency",
    recurring: true
  },
  {
    id: "pay_per_verification",
    name: "One run",
    price: "₹49",
    quota: "1 paid verification",
    maxAgents: 2,
    reports: "Public report",
    badge: "Included",
    support: "Self-serve",
    cta: "Run once",
    recurring: false
  }
];

export const paidPricingPlans = pricingPlans.filter((plan) => plan.id !== "free");

export function getPricingPlan(id: PricingPlanId) {
  return pricingPlans.find((plan) => plan.id === id);
}

export type BillingAccount = {
  plan?: PricingPlanId;
  billingStatus?: string;
  oneRunCredits?: number;
  updatedAt?: string;
};

/** Resolves only payment-provider states that have actually granted access. */
export function resolveEntitledPlan(account: BillingAccount | null | undefined): PricingPlanId {
  if (account?.plan === "builder" || account?.plan === "agency") {
    return account.billingStatus === "active" ? account.plan : "free";
  }

  if (account?.plan === "pay_per_verification" && account.billingStatus === "paid" && (account.oneRunCredits ?? 0) > 0) {
    return "pay_per_verification";
  }

  return "free";
}

export function entitlementForPlan(planId: PricingPlanId) {
  const plan = getPricingPlan(planId);
  if (!plan) throw new Error(`Unknown pricing plan: ${planId}`);
  return {
    maxAgents: plan.maxAgents,
    monthlyTestLimit: planId === "builder" ? 25 : planId === "agency" ? 100 : undefined,
    consumesOneRunCredit: planId === "pay_per_verification"
  };
}
