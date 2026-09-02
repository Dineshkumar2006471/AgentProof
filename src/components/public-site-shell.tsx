import Image from "next/image";
import Link from "next/link";
import { policyLinks } from "@/lib/policies";

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--color-surface-bright)] font-mono text-[var(--color-ink-graphite)]">
    <header className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-6 py-5">
        <Link href="/" aria-label="AgentProof home"><Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={34} priority style={{ mixBlendMode: "multiply" }} /></Link>
        <nav className="flex flex-wrap justify-end gap-4 text-xs font-bold uppercase text-[var(--color-on-surface-variant)]" aria-label="Public navigation"><Link className="hover:text-[var(--color-seal-indigo)]" href="/docs">Docs</Link><Link className="hover:text-[var(--color-seal-indigo)]" href="/pricing">Pricing</Link><Link className="hover:text-[var(--color-seal-indigo)]" href="/verify/demo">Sample report</Link><Link className="hover:text-[var(--color-seal-indigo)]" href="/auth/sign-in">Sign in</Link></nav>
      </div>
    </header>
    {children}
    <footer className="border-t border-[var(--color-outline-variant)] bg-[var(--color-paper-cream)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-8 text-xs text-[var(--color-on-surface-variant)]"><span>© 2026 AGENTPROOF</span><nav className="flex flex-wrap gap-4" aria-label="Legal navigation"><Link href={policyLinks.privacy}>Privacy</Link><Link href={policyLinks.terms}>Terms</Link><Link href={policyLinks.refunds}>Refunds</Link><Link href={policyLinks.support}>Support</Link></nav></div>
    </footer>
  </div>;
}
