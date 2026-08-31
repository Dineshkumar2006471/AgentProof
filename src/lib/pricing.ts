export type PricingPlanId = "free" | "builder" | "agency" | "pay_per_verification";

export type PricingPlan = {
  id: PricingPlanId;
  name: string;
  price: string;
  quota: string;
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
    quota: "1 agent / 5 tests per run",
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
    quota: "1 agent / 1 run",
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
