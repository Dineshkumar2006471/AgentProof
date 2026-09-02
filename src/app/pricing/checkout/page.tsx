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
  const checkoutAllowed = dodoCheckoutEnabled();
  const displayName = user.name ?? user.username ?? "Authenticated account";
  const email = user.email ?? user.username ?? "Verified account email";
  const capacityValue = plan.id === "pay_per_verification"
    ? "1 VERIFICATION RUN"
    : `${plan.maxAgents} ${plan.maxAgents === 1 ? "AGENT" : "AGENTS"}`;
  const capacityDetail = plan.id === "pay_per_verification"
    ? `UP TO ${plan.maxTestsPerRun} TESTS`
    : `${plan.monthlyTestLimit} TESTS / ${plan.monthlyRunLimit} RUNS MONTHLY`;
  const checkoutAction = checkoutAllowed
    ? <CheckoutButton plan={plan.id} label={`CONTINUE TO ${plan.name.toUpperCase()}`} featured />
    : <div className="checkout-gate"><span className="eyebrow">PAYMENTS NOT YET AVAILABLE</span><p>Free public-beta access remains available. Paid checkout will open after live billing is enabled.</p><Link href="/pricing" className="mono text-[var(--color-seal-indigo)]">Return to plans</Link></div>;

  return <AppShell title="Checkout" section="BILLING"><div className="workspace-page checkout-page">
    <PageHeader eyebrow="BILLING" title={`CONFIRM ${plan.name.toUpperCase()} ACCESS`} description="Review the selected verification capacity before opening the secure hosted checkout." actions={<ActionButton href="/pricing" variant="quiet" icon={<ArrowLeft size={15} />}>Back to plans</ActionButton>} />
    <KpiGrid metrics={[{ label: "SELECTED PLAN", value: plan.name.toUpperCase(), detail: plan.recurring ? "MONTHLY SUBSCRIPTION" : "ONE-TIME PURCHASE" }, { label: "PRICE", value: plan.price.replace(" / mo", ""), detail: plan.recurring ? "BILLED MONTHLY" : "CHARGED ONCE", tone: "pass" }, { label: "CAPACITY", value: capacityValue, detail: capacityDetail }, { label: "REPORTS", value: plan.reports.toUpperCase(), detail: "AVAILABLE AFTER VERIFIED PAYMENT" }]} />
    {checkoutAllowed && <div className="checkout-mobile-action">{checkoutAction}</div>}
    <div className="checkout-layout">
      <section className="workspace-panel checkout-summary" aria-labelledby="checkout-summary-title">
        <div className="workspace-panel__header"><span className="eyebrow">ORDER REVIEW</span><h2 id="checkout-summary-title" className="workspace-panel__title mt-2">{plan.name} verification capacity</h2><p className="workspace-panel__body">Payment access is granted only after Dodo confirms the transaction through a signed webhook.</p></div>
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
        <div className="checkout-desktop-action">{checkoutAction}</div>
      </aside>
    </div>
  </div></AppShell>;
}
