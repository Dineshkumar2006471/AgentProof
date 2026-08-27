import Link from "next/link";
import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/auth/require-page-user";

export default async function ProfilePage() {
  const user = await requirePageUser("/profile");
  const accountLabel = user.username ?? "Authenticated user";
  const initials = accountLabel.slice(0, 1).toUpperCase();

  return (
    <AppShell title="Profile settings" section="ACCOUNT"><div className="workspace-page">
        <header className="workspace-page-header">
          <span className="eyebrow">ACCOUNT / PROFILE</span>
          <h1 className="section-title mt-4">Your AgentProof identity</h1>
          <p className="body-lg mt-3 max-w-2xl">Manage the account that owns your agent registry, verification runs, and published evidence.</p>
        </header>

        <div className="settings-layout">
        <section className="workspace-panel" aria-labelledby="account-details-title">
          <div className="settings-identity">
            <div className="settings-identity__avatar" aria-hidden="true">{initials}</div>
            <div>
              <span className="eyebrow">SIGNED-IN ACCOUNT</span>
              <h2 id="account-details-title" className="section-heading__title mt-2 break-all">{accountLabel}</h2>
            </div>
          </div>
          <dl className="settings-rows">
            <div><dt className="eyebrow">USERNAME / EMAIL</dt><dd className="mono">{accountLabel}</dd></div>
            <div><dt className="eyebrow">USER ID</dt><dd className="mono">{user.sub}</dd></div>
            <div><dt className="eyebrow">ACCESS</dt><dd className="flex items-center gap-2 font-data-label text-xs uppercase text-[var(--color-pass-moss)]"><ShieldCheck size={15} /> Authenticated</dd></div>
          </dl>
        </section>

        <aside className="workflow-aside">
          <Link href="/dashboard" className="workspace-panel group p-5 transition-colors hover:border-[var(--color-seal-indigo)]">
            <UserRound size={18} className="text-[var(--color-seal-indigo)]" />
            <strong className="mt-4 block font-mono text-sm">Open verification workspace</strong>
            <span className="mono mt-2 flex items-center gap-2 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-seal-indigo)]">View agents <ArrowRight size={14} /></span>
          </Link>
          <Link href="/" className="workspace-panel group p-5 transition-colors hover:border-[var(--color-seal-indigo)]">
            <span className="eyebrow">PUBLIC SURFACE</span>
            <strong className="mt-4 block font-mono text-sm">Return to AgentProof</strong>
            <span className="mono mt-2 flex items-center gap-2 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-seal-indigo)]">Read the product overview <ArrowRight size={14} /></span>
          </Link>
        </aside></div>
      </div></AppShell>
  );
}
