import type { Metadata } from "next";
import Link from "next/link";
import { PublicSiteShell } from "@/components/public-site-shell";
import { guides } from "@/lib/public-content";

export const metadata: Metadata = { title: "AI Agent Verification Guides", description: "Practical guides for AI agent contracts, adversarial testing, reliability evidence, and production verification.", alternates: { canonical: "/docs" } };

export default function DocsIndexPage() {
  return <PublicSiteShell><main className="mx-auto max-w-6xl px-6 py-16"><span className="eyebrow">AGENTPROOF DOCUMENTATION</span><h1 className="mt-4 max-w-3xl font-mono text-4xl font-bold uppercase md:text-5xl">Build evidence for AI agent behavior.</h1><p className="mt-6 max-w-2xl border-l-2 border-[var(--color-seal-indigo)] pl-4 text-base leading-7 text-[var(--color-on-surface-variant)]">Guides for writing executable contracts, testing live agents, finding unsafe behavior, and sharing reliability evidence.</p><div className="mt-12 grid gap-4 md:grid-cols-2">{guides.map((guide) => <Link href={`/docs/${guide.slug}`} key={guide.slug} className="group border border-[var(--color-outline-variant)] bg-[var(--color-paper-cream)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-seal-indigo)] hover:shadow-md"><span className="eyebrow text-[var(--color-seal-indigo)]">{guide.keyword}</span><h2 className="mt-3 font-mono text-xl font-bold uppercase group-hover:text-[var(--color-seal-indigo)]">{guide.title}</h2><p className="mt-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">{guide.description}</p></Link>)}</div><Link href="/case-studies/customer-support-agent-safety" className="mt-10 inline-flex border-b border-[var(--color-seal-indigo)] pb-1 text-sm font-bold text-[var(--color-seal-indigo)]">Read the controlled support-agent case study</Link></main></PublicSiteShell>;
}
