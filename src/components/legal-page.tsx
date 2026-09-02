import { PublicSiteShell } from "@/components/public-site-shell";

export function LegalPage({ title, updatedAt, children }: { title: string; updatedAt: string; children: React.ReactNode }) {
  return <PublicSiteShell><main className="mx-auto max-w-3xl px-6 py-16"><span className="eyebrow">AGENTPROOF POLICIES</span><h1 className="mt-4 font-mono text-3xl font-bold uppercase md:text-4xl">{title}</h1><p className="mt-4 border-l-2 border-[var(--color-seal-indigo)] pl-3 text-sm text-[var(--color-on-surface-variant)]">Effective {updatedAt}</p><article className="legal-copy mt-10 grid gap-8 text-sm leading-7 text-[var(--color-on-surface-variant)]">{children}</article></main></PublicSiteShell>;
}
