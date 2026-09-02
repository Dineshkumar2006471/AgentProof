import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";
import { getCurrentUser } from "@/lib/auth/session";
import { getBillingAccount, listAgentsByOwner } from "@/lib/aws/dynamodb";
import { entitlementForPlan, getPricingPlan, pricingPlans, resolveEntitledPlan } from "@/lib/pricing";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const [billingAccount, agents] = user
    ? await Promise.all([getBillingAccount(user.sub), listAgentsByOwner(user.sub)])
    : [null, []];
  const planId = resolveEntitledPlan(billingAccount);
  const currentPlan = getPricingPlan(planId)!;
  const { maxAgents } = entitlementForPlan(planId);
  const planDetail = user ? `${agents.length} OF ${maxAgents} AGENTS REGISTERED` : "SIGN IN TO VIEW USAGE";

  return <AppShell title="Plans & usage" section="BILLING"><div className="workspace-page"><PageHeader eyebrow="PRICING" title="SELL VERIFIED DEPLOYMENTS" description="Choose the amount of verification evidence your team needs to put an agent in the world." /><KpiGrid metrics={[{ label: "Plans available", value: String(pricingPlans.length), detail: "Flexible verification capacity" }, { label: "Starting price", value: "₹0", detail: "No card required", tone: "pass" }, { label: "Recommended", value: "Builder", detail: "For active teams" }, { label: "Current plan", value: currentPlan.name.toUpperCase(), detail: planDetail, tone: planId === "free" ? "default" : "pass" }]} /><section className="workspace-panel"><div className="workspace-panel__title"><span className="eyebrow">PLAN COMPARISON</span><h2 className="workspace-heading mt-2">Choose your verification capacity</h2></div><div className="pricing-table"><div className="pricing-table__head"><span>PLAN</span><span>PRICE</span><span>QUOTA</span><span>REPORTS</span><span>BADGE</span><span>SUPPORT</span><span /></div>{pricingPlans.map((plan, index) => <div className={`pricing-table__row ${index === 1 ? "is-featured" : ""}`} key={plan.id}><strong>{plan.name}{index === 1 && <small>RECOMMENDED</small>}</strong><span className="font-bold">{plan.price}</span><span>{plan.quota}</span><span>{plan.reports}</span><span>{plan.badge}</span><span>{plan.support}</span><ActionButton href={plan.id === "free" ? "/auth/sign-up" : `/pricing/checkout?plan=${plan.id}`} variant={index === 1 ? "primary" : "quiet"} icon={null}>{plan.id === "free" ? plan.cta : "Review plan"}</ActionButton></div>)}</div></section><div className="pricing-note"><span className="eyebrow">DODO PAYMENTS / TEST MODE</span><p>Paid checkout is being validated privately while free beta access remains available.</p></div><Link className="mono text-[var(--color-seal-indigo)]" href="/">← Return to AgentProof</Link></div></AppShell>;
}
