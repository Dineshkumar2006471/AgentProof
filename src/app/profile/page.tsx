import Link from "next/link";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/auth/require-page-user";
import { getBillingAccount, listAgentsByOwner } from "@/lib/aws/dynamodb";
import { entitlementForPlan, getPricingPlan, resolveEntitledPlan } from "@/lib/pricing";

export default async function ProfilePage() {
  const user = await requirePageUser("/profile");
  const accountName = user.name ?? (user.email ? user.email.split("@")[0] : user.username) ?? "Authenticated user";
  const accountEmail = user.email ?? (user.username?.includes("@") ? user.username : "Email unavailable");
  const initials = accountName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const [billingAccount, agents] = await Promise.all([getBillingAccount(user.sub), listAgentsByOwner(user.sub)]);
  const planId = resolveEntitledPlan(billingAccount);
  const plan = getPricingPlan(planId)!;
  const { maxAgents } = entitlementForPlan(planId);
  const billingState = planId === "free" ? "FREE BETA" : billingAccount?.billingStatus === "active" ? "ACTIVE" : "PENDING";

  return (
    <AppShell title="PROFILE SETTINGS" section="ACCOUNT"><div className="workspace-page profile-page">
        <header className="workspace-page-header">
          <p className="body-lg max-w-3xl">Manage the account that owns your agent registry, verification runs, and published evidence.</p>
        </header>

        <div className="settings-layout">
        <section className="workspace-panel" aria-labelledby="account-details-title">
          <div className="settings-identity">
            <div className="settings-identity__avatar" aria-hidden="true">{initials}</div>
            <div>
              <span className="eyebrow">SIGNED-IN ACCOUNT</span>
              <h2 id="account-details-title" className="section-heading__title mt-2">{accountName}</h2>
            </div>
          </div>
          <dl className="settings-rows">
            <div><dt className="eyebrow">FULL NAME</dt><dd>{accountName}</dd></div>
            <div><dt className="eyebrow">EMAIL ADDRESS</dt><dd className="mono break-all">{accountEmail}</dd></div>
            <div><dt className="eyebrow">CURRENT PLAN</dt><dd>{plan.name.toUpperCase()} / {plan.price.toUpperCase()}</dd></div>
            <div><dt className="eyebrow">AGENT CAPACITY</dt><dd>{agents.length} OF {maxAgents} AGENTS REGISTERED</dd></div>
            <div><dt className="eyebrow">BILLING STATUS</dt><dd className="font-data-label text-xs uppercase text-[var(--color-pass-moss)]">{billingState}</dd></div>
            <div><dt className="eyebrow">ACCOUNT STATUS</dt><dd className="flex items-center gap-2 font-data-label text-xs uppercase text-[var(--color-pass-moss)]"><ShieldCheck size={15} /> AUTHENTICATED</dd></div>
          </dl>
        </section>

        <aside className="workflow-aside">
            <Link href="/dashboard" className="workspace-panel group p-5 transition-colors hover:border-[var(--color-seal-indigo)]">
            <UserRound size={18} className="text-[var(--color-seal-indigo)]" />
            <strong className="mt-4 block font-mono text-sm">OPEN VERIFICATION WORKSPACE</strong>
            <span className="mono mt-2 flex items-center gap-2 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-seal-indigo)]">VIEW AGENTS <ArrowRight size={14} /></span>
          </Link>
          <Link href="/" className="workspace-panel group p-5 transition-colors hover:border-[var(--color-seal-indigo)]">
            <span className="eyebrow">PUBLIC SURFACE</span>
            <strong className="mt-4 block font-mono text-sm">RETURN TO AGENTPROOF</strong>
            <span className="mono mt-2 flex items-center gap-2 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-seal-indigo)]">READ THE PRODUCT OVERVIEW <ArrowRight size={14} /></span>
          </Link>
          <Link href="/pricing" className="workspace-panel group p-5 transition-colors hover:border-[var(--color-seal-indigo)]">
            <span className="eyebrow">PLAN MANAGEMENT</span>
            <strong className="mt-4 block font-mono text-sm">VIEW PLANS AND USAGE</strong>
            <span className="mono mt-2 flex items-center gap-2 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-seal-indigo)]">MANAGE PLAN <ArrowRight size={14} /></span>
          </Link>
        </aside></div>
      </div></AppShell>
  );
}
