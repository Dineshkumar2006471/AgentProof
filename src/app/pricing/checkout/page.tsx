import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CheckoutButton } from "@/components/checkout-button";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";
import { dodoCheckoutEnabled } from "@/lib/dodo";
import { getPricingPlan, type PricingPlanId } from "@/lib/pricing";
import { requirePageUser } from "@/lib/auth/require-page-user";
import { redirect } from "next/navigation";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: planParam } = await searchParams;
  const planId = planParam as PricingPlanId | undefined;
  const plan = planId ? getPricingPlan(planId) : undefined;
  if (!plan || plan.id === "free") redirect("/pricing");

  const user = await requirePageUser(`/pricing/checkout?plan=${plan.id}`);
  const checkoutAllowed = dodoCheckoutEnabled(user.sub);
  const displayName = user.name ?? user.username ?? "Authenticated account";
  const email = user.email ?? user.username ?? "Verified account email";

  return <AppShell title="Checkout" section="BILLING"><div className="workspace-page checkout-page">
    <PageHeader eyebrow="BILLING / TEST MODE" title={`CONFIRM ${plan.name.toUpperCase()} ACCESS`} description="Review the selected verification capacity before opening the secure hosted checkout." actions={<ActionButton href="/pricing" variant="quiet" icon={<ArrowLeft size={15} />}>Back to plans</ActionButton>} />
    <KpiGrid metrics={[{ label: "Selected plan", value: plan.name, detail: plan.recurring ? "Monthly subscription" : "One-time purchase" }, { label: "Price", value: plan.price.replace(" / mo", ""), detail: plan.recurring ? "Billed monthly" : "Charged once", tone: "pass" }, { label: "Capacity", value: plan.quota, detail: "Included verification usage" }, { label: "Reports", value: plan.reports, detail: "Available after verified payment" }]} />
    <div className="checkout-layout">
      <section className="workspace-panel checkout-summary" aria-labelledby="checkout-summary-title">
        <div className="workspace-panel__header"><span className="eyebrow">ORDER REVIEW</span><h2 id="checkout-summary-title" className="workspace-panel__title mt-2">{plan.name} verification capacity</h2><p className="workspace-panel__body">This selection is mapped to the AgentProof {plan.name} product in Dodo test mode.</p></div>
        <dl className="checkout-summary__rows">
          <div><dt>PLAN</dt><dd>{plan.name}</dd></div>
          <div><dt>PRICE</dt><dd>{plan.price}{plan.recurring && <small> / MONTH</small>}</dd></div>
          <div><dt>USAGE</dt><dd>{plan.quota}</dd></div>
          <div><dt>SUPPORT</dt><dd>{plan.support}</dd></div>
        </dl>
      </section>
      <aside className="workspace-panel checkout-account" aria-labelledby="checkout-account-title">
        <div className="workspace-panel__header"><CreditCard size={22} className="text-[var(--color-seal-indigo)]" /><span className="eyebrow mt-5">ACCOUNT</span><h2 id="checkout-account-title" className="workspace-heading mt-2">{displayName}</h2><p className="mono mt-2 break-all">{email}</p></div>
        <div className="checkout-account__note"><ShieldCheck size={17} /><span>Payment confirmation is processed by Dodo. AgentProof grants paid access only after a verified webhook.</span></div>
        {checkoutAllowed ? <CheckoutButton plan={plan.id} label={`CONTINUE TO ${plan.name.toUpperCase()}`} featured /> : <div className="checkout-gate"><span className="eyebrow">TEST CHECKOUT GATED</span><p>Free beta access remains active. Paid checkout is available only to approved billing test accounts.</p><Link href="/pricing" className="mono text-[var(--color-seal-indigo)]">Return to plans</Link></div>}
      </aside>
    </div>
  </div></AppShell>;
}
