"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { FlaskConical, Briefcase, Zap } from "lucide-react";

/* ── Verification Steps ─────────────────────────────────────────────── */
const howItWorksSteps = [
  { num: "01", label: "Describe what your agent promises", body: "Builder describes capabilities, restrictions, and success criteria in plain language." },
  { num: "02", label: "We generate real tests", body: "Happy path, edge cases, adversarial — not scripted demos, real verification scenarios." },
  { num: "03", label: "We run them against your live agent", body: "Tests execute against your actual endpoint, not a fake transcript." },
  { num: "04", label: "We collect evidence", body: "Every result traces to tool calls, state changes, and failure reason." },
  { num: "05", label: "You get a Reliability Score", body: "Score plus VERIFIED, CONDITIONAL, FAILED, or BLOCKED." },
];

const tickerItems = [
  "Forensic Ledger",
  "Empirical Proof",
  "No Hallucinations",
  "Verifiable AI",
  "Evidence-Based",
  "Immutable Audit Trail",
];

/* ═══════════════════════════════════════════════════════════════
   Landing Page Component
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const navEl = navRef.current;

    const onScroll = () => {
      if (!scrollEl || !navEl) return;
      if (scrollEl.scrollTop > 50) {
        navEl.classList.add("scrolled");
      } else {
        navEl.classList.remove("scrolled");
      }
    };
    scrollEl?.addEventListener("scroll", onScroll);

    /* ── IntersectionObserver for reveals ────────────────────── */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { root: scrollEl, rootMargin: "0px", threshold: 0.15 }
    );

    document.querySelectorAll(".reveal-element").forEach((el) => {
      observer.observe(el);
    });

    /* ── Horizontal Scrolling Ticker (requestAnimationFrame) ── */
    let tickerAnimationId: number;
    let tickerPos = 0;
    const animateTicker = () => {
      if (tickerRef.current) {
        tickerPos -= 0.5;
        if (tickerPos <= -tickerRef.current.scrollWidth / 2) {
          tickerPos = 0;
        }
        tickerRef.current.style.transform = `translateX(${tickerPos}px)`;
      }
      tickerAnimationId = requestAnimationFrame(animateTicker);
    };
    animateTicker();

    return () => {
      scrollEl?.removeEventListener("scroll", onScroll);
      observer.disconnect();
      cancelAnimationFrame(tickerAnimationId);
    };
  }, []);

  return (
    <main className="page-shell" style={{ overflow: "hidden" }}>
      {/* ── Navigation (kept as-is per user request) ─────────── */}
      <nav ref={navRef} className="main-nav" id="main-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <Image
              src="/logo-agentproof.png"
              alt="AgentProof"
              width={165}
              height={40}
              priority
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
          <div className="nav-links">
            <Link href="#problem">Platform</Link>
            <Link href="#how-it-works">Evidence</Link>
            <Link href="#proof">Verification</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div>
            <Link href="/auth/sign-in" className="btn-primary">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Scroll Container (no snap) ───────────────────────── */}
      <div ref={scrollRef} className="lp-scroll" id="story-scroll">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO — Clean cream bg, large sans-serif headline
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="lp-hero">
          <div className="lp-hero__inner">
            <h1 className="lp-hero__headline">
              You claim it works. Prove it
            </h1>
            <p className="lp-hero__sub reveal-element visible">
              Convert agent promises into executable tests, run them against the real endpoint, and issue a report a client can understand.
            </p>
            <div className="lp-hero__cta reveal-element visible">
              <Link href="/agents/new" className="lp-btn lp-btn--primary">
                Get your first verification free →
              </Link>
              <Link href="#how-it-works" className="lp-btn lp-btn--outline">
                See how it works
              </Link>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HORIZONTAL TICKER (continuous motion)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="lp-ticker">
          <div className="lp-ticker__track">
            <div ref={tickerRef} className="lp-ticker__inner">
              {/* Duplicate items for seamless loop */}
              {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((text, i) => (
                <span key={i} className="lp-ticker__item">
                  {text}
                  <span className="lp-ticker__dot">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            WHAT IS AGENTPROOF — 3-card grid (Vesto style)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="lp-section" id="problem">
          <div className="lp-container">
            <div className="lp-section__header">
              <p className="lp-overline reveal-element">What is AgentProof</p>
              <h2 className="lp-section__title reveal-element">
                Modern AI development cannot run on hallucinations.
              </h2>
              <p className="lp-section__desc reveal-element">
                AgentProof is an empirical verification engine for AI agents. We help indie builders, small agencies, and freelancers turn ephemeral AI claims into concrete, undeniable evidence for their clients.
              </p>
            </div>

            <div className="lp-cards">
              <div className="lp-card reveal-element" style={{ "--stagger": 0 } as React.CSSProperties}>
                <div className="lp-card__icon"><FlaskConical size={32} color="var(--seal-indigo)" /></div>
                <h3 className="lp-card__title">For Indie Builders</h3>
                <p className="lp-card__body">Deploy with confidence. Stop relying on manual prompt-testing and let our engine simulate thousands of edge cases to verify your agent&apos;s bounds.</p>
              </div>
              <div className="lp-card reveal-element" style={{ "--stagger": 1 } as React.CSSProperties}>
                <div className="lp-card__icon"><Briefcase size={32} color="var(--seal-indigo)" /></div>
                <h3 className="lp-card__title">For Small Agencies</h3>
                <p className="lp-card__body">Prove your value. Hand your clients a verified AgentProof reliability score along with your deliverables to show your AI actually works.</p>
              </div>
              <div className="lp-card reveal-element" style={{ "--stagger": 2 } as React.CSSProperties}>
                <div className="lp-card__icon"><Zap size={32} color="var(--seal-indigo)" /></div>
                <h3 className="lp-card__title">For Freelancers</h3>
                <p className="lp-card__body">Win more contracts. Stand out from the crowd by guaranteeing your autonomous solutions are empirically verified against edge cases and hallucinations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HOW IT WORKS — Steps + CSS Diagram
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="lp-section lp-section--white" id="how-it-works">
          <div className="lp-container">
            <div className="lp-split">
              {/* Left: Steps */}
              <div className="lp-split__left">
                <p className="lp-overline reveal-element">The Workflow</p>
                <h2 className="lp-section__title reveal-element" style={{ textAlign: "left", marginBottom: "1rem" }}>
                  Five steps to verified AI
                </h2>
                <p className="lp-section__desc reveal-element" style={{ textAlign: "left", maxWidth: "none", marginBottom: "2.5rem" }}>
                  Our architecture enforces a disciplined grid of verification, turning ephemeral claims into concrete evidence.
                </p>
                <div className="lp-steps reveal-element">
                  {howItWorksSteps.map((step) => (
                    <div className="lp-step" key={step.num}>
                      <span className="lp-step__num">{step.num}</span>
                      <div>
                        <strong className="lp-step__label">{step.label}</strong>
                        <p className="lp-step__body">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: CSS Workflow Diagram */}
              <div className="lp-split__right reveal-element">
                <div className="lp-diagram">
                  {/* Target */}
                  <div className="lp-diagram__block lp-diagram__block--target">
                    <span className="lp-diagram__label">Target System</span>
                    <span className="lp-diagram__value">Customer Support AI</span>
                  </div>
                  <div className="lp-diagram__connector" />

                  {/* Engine */}
                  <div className="lp-diagram__block lp-diagram__block--engine">
                    <span className="lp-diagram__engine-label">AgentProof Engine</span>
                    <div className="lp-diagram__row">
                      <span>Generating Adversarial Inputs</span>
                      <span className="lp-diagram__status">[100%]</span>
                    </div>
                    <div className="lp-diagram__row">
                      <span>Executing Tool Call Analysis</span>
                      <span className="lp-diagram__status lp-diagram__status--active">[ACTIVE]</span>
                    </div>
                    <div className="lp-diagram__row">
                      <span>Semantic Drift Check</span>
                      <span className="lp-diagram__status">[WAITING]</span>
                    </div>
                  </div>
                  <div className="lp-diagram__connector" />

                  {/* Results */}
                  <div className="lp-diagram__results">
                    <div className="lp-diagram__result lp-diagram__result--score">
                      <span className="lp-diagram__result-label">Reliability Score</span>
                      <span className="lp-diagram__result-value">94.2%</span>
                    </div>
                    <div className="lp-diagram__result lp-diagram__result--hash">
                      <span className="lp-diagram__result-label">Status</span>
                      <span className="lp-diagram__result-value lp-diagram__result-value--small">VERIFIED ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CTA Section (dark, like Vesto's green band)
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="lp-cta" id="proof">
          <div className="lp-container" style={{ textAlign: "center" }}>
            <h2 className="lp-cta__headline reveal-element">
              Ready to prove your agent works?
            </h2>
            <p className="lp-cta__sub reveal-element">
              Join the builders and enterprises who demand verifiable AI.
            </p>
            <Link href="/agents/new" className="lp-btn lp-btn--white reveal-element">
              Start your first verification — free →
            </Link>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FOOTER
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <footer className="lp-footer">
          <div className="lp-container">
            <div className="lp-footer__inner">
              <Image
                src="/logo-agentproof.png"
                alt="AgentProof"
                width={120}
                height={28}
                style={{ filter: "grayscale(1)", mixBlendMode: "multiply", opacity: 0.7 }}
              />
              <span className="lp-footer__copy">
                © 2026 AgentProof. Forensic Authority in AI Verification.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
