"use client";

import Link from "next/link";
import Image from "next/image";
import { HeroGradient } from "@/components/hero-gradient";
import { SketchyPipelineTerminal } from "@/components/sketchy-pipeline-terminal";
import { InteractiveCapabilities } from "@/components/interactive-capabilities";
import { pricingPlans } from "@/lib/pricing";
import { useState } from "react";
import {
  Menu,
  ArrowRight,
  FileText
} from "lucide-react";

const builderPrice = pricingPlans.find((plan) => plan.id === "builder")?.price.replace(" / mo", "") ?? "₹199";
const agencyPrice = pricingPlans.find((plan) => plan.id === "agency")?.price.replace(" / mo", "") ?? "₹499";
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "AgentProof",
      url: "https://agent-proof.dev",
      logo: "https://agent-proof.dev/icon.png"
    },
    {
      "@type": "WebSite",
      name: "AgentProof",
      url: "https://agent-proof.dev"
    },
    {
      "@type": "SoftwareApplication",
      name: "AgentProof",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://agent-proof.dev",
      description: "AI agent verification software that turns operational promises into executable tests and reliability evidence."
    }
  ]
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="landing-page overflow-x-clip bg-[var(--color-surface-bright)] min-h-screen font-body-md text-[var(--color-on-surface)] selection:bg-[var(--color-seal-indigo)] selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* 1. Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--color-surface-bright)]/80 backdrop-blur-md border-b border-[var(--color-outline-variant)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-12 py-4">
          <Link href="/" aria-label="AgentProof home" className="flex items-center gap-2">
            <Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={34} priority style={{ mixBlendMode: "multiply" }} />
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link className="font-data-label text-sm text-[var(--color-seal-indigo)] font-bold transition-colors" href="#platform">Platform</Link>
            <Link className="font-data-label text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="#evidence">Evidence</Link>
            <Link className="font-data-label text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="#pricing">Pricing</Link>
            <Link className="font-data-label text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="/docs">Docs</Link>
          </div>
          <Link href="/auth/sign-up" className="hidden md:flex bg-[var(--color-seal-indigo)] text-white font-data-label text-sm font-bold px-6 py-2.5 rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            Get started
          </Link>
          <button type="button" aria-label="Toggle navigation" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)} className="md:hidden text-[var(--color-on-surface)]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {mobileMenuOpen && <div className="md:hidden border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] px-6 py-4"><div className="flex flex-col gap-4"><Link onClick={() => setMobileMenuOpen(false)} className="font-data-label text-sm text-[var(--color-seal-indigo)]" href="#platform">Platform</Link><Link onClick={() => setMobileMenuOpen(false)} className="font-data-label text-sm text-[var(--color-on-surface-variant)]" href="#evidence">Evidence</Link><Link onClick={() => setMobileMenuOpen(false)} className="font-data-label text-sm text-[var(--color-on-surface-variant)]" href="#pricing">Pricing</Link><Link onClick={() => setMobileMenuOpen(false)} className="font-data-label text-sm text-[var(--color-on-surface-variant)]" href="/docs">Docs</Link><Link onClick={() => setMobileMenuOpen(false)} className="font-data-label text-sm font-bold text-[var(--color-seal-indigo)]" href="/auth/sign-up">Get started</Link></div></div>}
      </nav>

      {/* 2. Hero Section */}
      <header className="relative pt-32 pb-32 md:pt-48 md:pb-40 px-6 overflow-hidden">
        <HeroGradient />
        <div className="landing-hero-grid max-w-7xl mx-auto relative z-10 grid min-w-0 lg:grid-cols-2 gap-12 items-center">
          <div className="landing-hero-copy min-w-0 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-[var(--color-seal-indigo)] font-data-label text-xs font-bold mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--color-pass-moss)] animate-pulse"></span>
              AgentProof public beta is open
            </div>
            <h1 className="landing-hero-title font-mono font-bold text-4xl md:text-5xl lg:text-[54px] text-[var(--color-ink-graphite)] mb-6 leading-none tracking-tighter uppercase">
              <span className="block whitespace-nowrap">YOU CLAIM IT WORKS</span>
              <span className="mt-3 block whitespace-nowrap text-[var(--color-accent-violet)]">PROVE IT</span>
            </h1>
            <p className="font-mono text-lg md:text-xl text-[var(--color-on-surface-variant)] mb-10 max-w-lg leading-relaxed">
              The verification infrastructure for AI agents. We convert natural-language promises into executable contracts, then prove whether your agent keeps them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/auth/sign-up" className="bg-[var(--color-accent-violet)] text-white font-data-label text-sm font-bold px-8 py-4 rounded-md shadow-lg shadow-[var(--color-accent-violet)]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                Verify an Agent
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/verify/demo" className="bg-white border border-[var(--color-outline-variant)] text-[var(--color-ink-graphite)] font-data-label text-sm font-bold px-8 py-4 rounded-md shadow-sm hover:shadow-md hover:border-[var(--color-accent-violet)]/30 transition-all flex items-center justify-center gap-2">
                View Sample Report
                <FileText className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pipeline Hero Graphic */}
          <div className="landing-hero-art relative z-20 min-w-0">
            <SketchyPipelineTerminal />
          </div>
        </div>
      </header>

      {/* 3. The Trust Ticker */}
      <div id="evidence" className="landing-secondary ticker-wrap border-y border-[var(--color-ink-graphite)] bg-[var(--color-ink-graphite)] py-4 shadow-sm relative z-20">
        <div className="ticker font-data-label text-sm text-[var(--color-outline-variant)] uppercase tracking-widest font-bold flex">
          {/* Double content for seamless looping */}
          <div className="flex shrink-0">
            <span className="mx-8">AGENTPROOF VERIFIED</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">EMPIRICAL PROOF</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">NO FLUIDITY</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">DETERMINISTIC EVALUATION</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">FORENSIC AUTHORITY</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
          </div>
          <div className="flex shrink-0">
            <span className="mx-8">AGENTPROOF VERIFIED</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">EMPIRICAL PROOF</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">NO FLUIDITY</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">DETERMINISTIC EVALUATION</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
            <span className="mx-8">FORENSIC AUTHORITY</span><span className="text-[var(--color-hero-gradient-start)]">•</span>
          </div>
        </div>
      </div>

      {/* 4. Core Capabilities (Interactive Tabbed UI) */}
      <section className="landing-secondary py-32 px-6 bg-[var(--color-paper-cream)] border-b border-[var(--color-outline-variant)]" id="platform">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-plex-mono tracking-tighter font-bold text-3xl md:text-4xl text-[var(--color-ink-graphite)] mb-4">THE PROOF ENGINE</h2>
            <p className="font-mono text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
              NOT JUST AN LLM JUDGING ANOTHER LLM. WE RELY ON A DETERMINISTIC-FIRST JUDGMENT HIERARCHY.
            </p>
          </div>

          <InteractiveCapabilities />
        </div>
      </section>

      <section className="landing-secondary border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-bright)] px-6 py-24" aria-labelledby="verification-infrastructure-title">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)] lg:items-end">
          <div>
            <span className="font-data-label text-sm font-bold text-[var(--color-seal-indigo)]">AI AGENT VERIFICATION</span>
            <h2 id="verification-infrastructure-title" className="mt-4 font-plex-mono text-3xl font-bold text-[var(--color-ink-graphite)] md:text-4xl">TEST THE PROMISES YOUR AI AGENT MAKES.</h2>
            <p className="mt-5 max-w-2xl font-mono text-lg leading-relaxed text-[var(--color-on-surface-variant)]">AgentProof turns an agent&apos;s operational contract into executable AI agent tests, runs them against the live endpoint, and records reliability evidence that teams can inspect and share.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded border border-[var(--color-outline-variant)] bg-[var(--color-outline-variant)] sm:grid-cols-3">
            <article className="bg-[var(--color-surface-bright)] p-5"><h3 className="font-data-label text-sm font-bold text-[var(--color-ink-graphite)]">EXECUTABLE CONTRACTS</h3><p className="mt-3 font-mono text-xs leading-relaxed text-[var(--color-on-surface-variant)]">Define what an AI agent can do, must never do, and how success is measured.</p></article>
            <article className="bg-[var(--color-surface-bright)] p-5"><h3 className="font-data-label text-sm font-bold text-[var(--color-ink-graphite)]">REAL ENDPOINT TESTING</h3><p className="mt-3 font-mono text-xs leading-relaxed text-[var(--color-on-surface-variant)]">Test happy paths, boundaries, adversarial prompts, and real behavior from the deployed agent.</p></article>
            <article className="bg-[var(--color-surface-bright)] p-5"><h3 className="font-data-label text-sm font-bold text-[var(--color-ink-graphite)]">RELIABILITY EVIDENCE</h3><p className="mt-3 font-mono text-xs leading-relaxed text-[var(--color-on-surface-variant)]">Issue a clear reliability score and public verification report backed by recorded evidence.</p></article>
          </div>
        </div>
      </section>

      {/* 5. Pricing */}
      <section className="landing-secondary py-32 px-6 bg-[var(--color-surface-bright)]" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-plex-mono tracking-tighter font-bold text-3xl md:text-4xl text-[var(--color-ink-graphite)] mb-4">PAY FOR VERIFIED DEPLOYMENTS</h2>
            <p className="font-mono text-xl text-[var(--color-on-surface-variant)]">SIMPLE, PREDICTABLE PRICING FOR BUILDERS AND AGENCIES.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Free Tier */}
            <div className="landing-plan-card bg-white p-10 rounded-2xl shadow-sm border border-[var(--color-outline-variant)]">
              <h3 className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] mb-4">FREE</h3>
              <div className="font-data-label font-bold text-5xl text-[var(--color-ink-graphite)] mb-2 tracking-tight">₹0</div>
              <div className="font-data-label text-xs font-bold text-[var(--color-on-surface-variant)] mb-8">FOREVER</div>
              <ul className="space-y-4 font-data-label text-sm text-[var(--color-ink-graphite)] mb-10">
                <li className="flex items-center gap-3"><span className="text-[var(--color-seal-indigo)] font-bold">✓</span> 1 AGENT</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-seal-indigo)] font-bold">✓</span> 15 TESTS PER MONTH</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-seal-indigo)] font-bold">✓</span> 2 VERIFICATION RUNS PER MONTH</li>
              </ul>
              <Link href="/auth/sign-up" className="w-full border border-[var(--color-outline-variant)] text-[var(--color-ink-graphite)] font-data-label text-sm font-bold py-3 rounded hover:bg-[var(--color-surface-container)] transition-colors text-center block">Get Started</Link>
            </div>

            {/* Builder Tier (Highlighted) */}
            <div className="landing-plan-card bg-white p-10 rounded-2xl shadow-xl border-2 border-[var(--color-ink-graphite)] relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-ink-graphite)] text-white font-data-label text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">RECOMMENDED</div>
              <h3 className="font-data-label text-sm font-bold text-[var(--color-ink-graphite)] mb-4">BUILDER</h3>
              <div className="font-data-label font-bold text-5xl text-[var(--color-ink-graphite)] mb-2 tracking-tight">{builderPrice}</div>
              <div className="font-data-label text-xs font-bold text-[var(--color-on-surface-variant)] mb-8">PER MONTH</div>
              <ul className="space-y-4 font-data-label text-sm text-[var(--color-ink-graphite)] mb-10">
                <li className="flex items-center gap-3"><span className="text-[var(--color-pass-moss)] font-bold">✓</span> 3 AGENTS</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-pass-moss)] font-bold">✓</span> 100 TESTS PER MONTH</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-pass-moss)] font-bold">✓</span> 10 VERIFICATION RUNS PER MONTH</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-pass-moss)] font-bold">✓</span> PRIVATE AND PUBLIC REPORTS</li>
              </ul>
              <Link href="/pricing/checkout?plan=builder" className="w-full bg-[var(--color-ink-graphite)] text-white font-data-label text-sm font-bold py-3 rounded shadow-sm hover:bg-black transition-colors text-center block">Upgrade to Builder</Link>
            </div>

            {/* Agency Tier */}
            <div className="landing-plan-card bg-white p-10 rounded-2xl shadow-sm border border-[var(--color-outline-variant)]">
              <h3 className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] mb-4">AGENCY</h3>
              <div className="font-data-label font-bold text-5xl text-[var(--color-ink-graphite)] mb-2 tracking-tight">{agencyPrice}</div>
              <div className="font-data-label text-xs font-bold text-[var(--color-on-surface-variant)] mb-8">PER MONTH</div>
              <ul className="space-y-4 font-data-label text-sm text-[var(--color-ink-graphite)] mb-10">
                <li className="flex items-center gap-3"><span className="text-[var(--color-seal-indigo)] font-bold">✓</span> 10 AGENTS</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-seal-indigo)] font-bold">✓</span> 500 TESTS PER MONTH</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-seal-indigo)] font-bold">✓</span> 50 VERIFICATION RUNS PER MONTH</li>
                <li className="flex items-center gap-3"><span className="text-[var(--color-seal-indigo)] font-bold">✓</span> WHITE-LABEL REPORTS</li>
              </ul>
              <Link href="/pricing/checkout?plan=agency" className="w-full border border-[var(--color-outline-variant)] text-[var(--color-ink-graphite)] font-data-label text-sm font-bold py-3 rounded hover:bg-[var(--color-surface-container)] transition-colors text-center block">Start Agency</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="landing-secondary bg-[var(--color-paper-cream)] border-t border-[var(--color-outline-variant)] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={34} style={{ mixBlendMode: "multiply" }} />
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="#platform">PLATFORM</Link>
            <Link className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="#evidence">EVIDENCE</Link>
            <Link className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="/verify/demo">VERIFICATION</Link>
            <Link className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="/pricing">PRICING</Link>
            <Link className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="/docs">DOCS</Link>
            <Link className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="/privacy">PRIVACY</Link>
            <Link className="font-data-label text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] transition-colors" href="/support">SUPPORT</Link>
          </div>
          <div className="font-data-label text-xs text-[var(--color-on-surface-variant)] text-center md:text-right">
            © 2026 AGENTPROOF.<br/>FORENSIC AUTHORITY IN AI VERIFICATION.
          </div>
        </div>
      </footer>
    </div>
  );
}
