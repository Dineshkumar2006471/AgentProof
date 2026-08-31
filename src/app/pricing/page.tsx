import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CheckoutButton } from "@/components/checkout-button";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";
import { getCurrentUser } from "@/lib/auth/session";
import { dodoCheckoutEnabled } from "@/lib/dodo";
import { pricingPlans } from "@/lib/pricing";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const checkoutAllowed = user ? dodoCheckoutEnabled(user.sub) : false;

  return <AppShell title="Plans & usage" section="BILLING"><div className="workspace-page"><PageHeader eyebrow="PRICING" title="SELL VERIFIED DEPLOYMENTS" description="Choose the amount of verification evidence your team needs to put an agent in the world." /><KpiGrid metrics={[{ label: "Plans available", value: String(pricingPlans.length), detail: "Flexible verification capacity" }, { label: "Starting price", value: "₹0", detail: "No card required", tone: "pass" }, { label: "Recommended", value: "Builder", detail: "For active teams" }, { label: "Billing state", value: "Ready", detail: checkoutAllowed ? "Test checkout enabled" : "Test checkout gated" }]} /><section className="workspace-panel"><div className="workspace-panel__title"><span className="eyebrow">PLAN COMPARISON</span><h2 className="workspace-heading mt-2">Choose your verification capacity</h2></div><div className="pricing-table"><div className="pricing-table__head"><span>PLAN</span><span>PRICE</span><span>QUOTA</span><span>REPORTS</span><span>BADGE</span><span>SUPPORT</span><span /></div>{pricingPlans.map((plan, index) => <div className={`pricing-table__row ${index === 1 ? "is-featured" : ""}`} key={plan.id}><strong>{plan.name}{index === 1 && <small>RECOMMENDED</small>}</strong><span className="font-bold">{plan.price}</span><span>{plan.quota}</span><span>{plan.reports}</span><span>{plan.badge}</span><span>{plan.support}</span>{plan.id === "free" ? <ActionButton href="/auth/sign-up" variant="quiet" icon={null}>{plan.cta}</ActionButton> : checkoutAllowed ? <CheckoutButton plan={plan.id} label={plan.cta} featured={index === 1} /> : <ActionButton href="/pricing" variant={index === 1 ? "primary" : "quiet"} icon={null}>TEST CHECKOUT GATED</ActionButton>}</div>)}</div></section><div className="pricing-note"><span className="eyebrow">DODO PAYMENTS / TEST MODE</span><p>Paid checkout is being validated privately while free beta access remains available.</p></div><Link className="mono text-[var(--color-seal-indigo)]" href="/">← Return to AgentProof</Link></div></AppShell>;
}
