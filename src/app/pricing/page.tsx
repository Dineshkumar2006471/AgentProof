import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";

const plans = [
  { name: "Free", price: "₹0", quota: "1 agent / 25 tests", reports: "Public report", badge: "—", support: "Community", cta: "Start free" },
  { name: "Builder", price: "₹999 / mo", quota: "5 agents / 200 tests", reports: "Private + public", badge: "Included", support: "Priority", cta: "Start builder" },
  { name: "Agency", price: "₹4,999 / mo", quota: "Unlimited / 500 tests", reports: "White-label reports", badge: "Included", support: "Dedicated", cta: "Start agency" },
  { name: "One run", price: "₹299", quota: "1 agent / 1 run", reports: "Public report", badge: "Included", support: "Self-serve", cta: "Run once" }
];

export default function PricingPage() {
  return <AppShell title="Plans & usage" section="BILLING"><div className="workspace-page"><PageHeader eyebrow="PRICING" title="SELL VERIFIED DEPLOYMENTS" description="Choose the amount of verification evidence your team needs to put an agent in the world." /><KpiGrid metrics={[{ label: "Plans available", value: String(plans.length), detail: "Flexible verification capacity" }, { label: "Starting price", value: "₹0", detail: "No card required", tone: "pass" }, { label: "Recommended", value: "Builder", detail: "For active teams" }, { label: "Billing state", value: "Ready", detail: "Checkout integration pending" }]} /><section className="workspace-panel"><div className="workspace-panel__title"><span className="eyebrow">PLAN COMPARISON</span><h2 className="workspace-heading mt-2">Choose your verification capacity</h2></div><div className="pricing-table"><div className="pricing-table__head"><span>PLAN</span><span>PRICE</span><span>QUOTA</span><span>REPORTS</span><span>BADGE</span><span>SUPPORT</span><span /></div>{plans.map((plan, index) => <div className={`pricing-table__row ${index === 1 ? "is-featured" : ""}`} key={plan.name}><strong>{plan.name}{index === 1 && <small>RECOMMENDED</small>}</strong><span className="font-bold">{plan.price}</span><span>{plan.quota}</span><span>{plan.reports}</span><span>{plan.badge}</span><span>{plan.support}</span><ActionButton href="/agents/new" variant={index === 1 ? "primary" : "quiet"} icon={null}>{plan.cta}</ActionButton></div>)}</div></section><div className="pricing-note"><span className="eyebrow">DODO PAYMENTS / CHECKOUT READY</span><p>Subscriptions and pay-per-verification checkout are reserved for the production billing integration.</p></div><Link className="mono text-[var(--color-seal-indigo)]" href="/">← Return to AgentProof</Link></div></AppShell>;
}
