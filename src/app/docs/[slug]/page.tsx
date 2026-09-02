import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicSiteShell } from "@/components/public-site-shell";
import { guideBySlug, guides } from "@/lib/public-content";

type GuidePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return guides.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = guideBySlug((await params).slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.description, alternates: { canonical: `/docs/${guide.slug}` }, openGraph: { type: "article", title: guide.title, description: guide.description, url: `/docs/${guide.slug}` } };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = guideBySlug((await params).slug);
  if (!guide) notFound();
  const structuredData = { "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, dateModified: guide.updatedAt, datePublished: guide.updatedAt, mainEntityOfPage: `https://agent-proof.dev/docs/${guide.slug}`, author: { "@type": "Organization", name: "AgentProof" }, publisher: { "@type": "Organization", name: "AgentProof", logo: { "@type": "ImageObject", url: "https://agent-proof.dev/icon.png" } } };
  return <PublicSiteShell><main className="mx-auto max-w-3xl px-6 py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><span className="eyebrow text-[var(--color-seal-indigo)]">{guide.keyword}</span><h1 className="mt-4 font-mono text-3xl font-bold uppercase md:text-5xl">{guide.title}</h1><p className="mt-6 border-l-2 border-[var(--color-seal-indigo)] pl-4 text-lg leading-8 text-[var(--color-on-surface-variant)]">{guide.description}</p><article className="legal-copy mt-12 grid gap-10 text-base leading-8 text-[var(--color-on-surface-variant)]">{guide.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</article></main></PublicSiteShell>;
}
