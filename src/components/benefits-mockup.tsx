"use client";

import { useState } from "react";
import { Terminal, ShieldCheck, CheckCircle2, Copy } from "lucide-react";

export function BenefitsMockup() {
  const [activeTab, setActiveTab] = useState<"builders" | "buyers">("builders");

  return (
    <div className="w-full">
      {/* Editorial Text */}
      <div className="mb-12">
        <h2 className="font-mono tracking-tighter font-bold text-4xl md:text-5xl text-[var(--color-ink-graphite)] mb-6 leading-[1.1]">
          Built for the long tail of AI builders.
        </h2>
        <p className="font-body-lg text-lg text-[var(--color-on-surface-variant)] max-w-2xl leading-relaxed">
          Existing evaluation tools are built for MLOps engineers. AgentProof is for the two-person agency shipping a bot to a clinic next week.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="flex gap-4 mb-8 border-b border-[var(--color-outline-variant)]">
        <button
          onClick={() => setActiveTab("builders")}
          className={`pb-4 px-2 font-data-label text-sm font-bold tracking-widest uppercase transition-colors relative ${
            activeTab === "builders" ? "text-[var(--color-accent-violet)]" : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-ink-graphite)]"
          }`}
        >
          Independent Builders
          {activeTab === "builders" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-accent-violet)]"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("buyers")}
          className={`pb-4 px-2 font-data-label text-sm font-bold tracking-widest uppercase transition-colors relative ${
            activeTab === "buyers" ? "text-[var(--color-accent-violet)]" : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-ink-graphite)]"
          }`}
        >
          Business Buyers
          {activeTab === "buyers" && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-accent-violet)]"></span>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* Descriptive Text for Active Tab */}
        <div>
          {activeTab === "builders" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="font-display-lg text-2xl font-bold text-[var(--color-ink-graphite)] mb-4">Prove your work to clients.</h3>
              <p className="font-body-md text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
                Stop saying "it should work." Generate a verified, cryptographically signed report that proves your agent is robust, safe, and ready for production handoff.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 font-data-label text-xs font-bold text-[var(--color-ink-graphite)] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-pass-moss)]" /> Catch critical failures before handoff
                </li>
                <li className="flex items-center gap-3 font-data-label text-xs font-bold text-[var(--color-ink-graphite)] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-pass-moss)]" /> Win client trust instantly
                </li>
              </ul>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="font-display-lg text-2xl font-bold text-[var(--color-ink-graphite)] mb-4">Demand proof before you pay.</h3>
              <p className="font-body-md text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
                Buying an AI agent from a freelancer? Don't deploy a black box to your customers. Demand an AgentProof Verification Report to know exactly what you're buying.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 font-data-label text-xs font-bold text-[var(--color-ink-graphite)] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-pass-moss)]" /> Independent audit of deliverables
                </li>
                <li className="flex items-center gap-3 font-data-label text-xs font-bold text-[var(--color-ink-graphite)] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-pass-moss)]" /> Protect your brand reputation
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* High-Fidelity UI Mockup */}
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-[#333] relative">

          {/* Header */}
          <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-3 border-b border-[#404040]">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="font-mono text-[10px] text-[#858585] tracking-widest uppercase font-bold ml-2">
              {activeTab === "builders" ? "agentproof.config.json" : "verification-report.pdf"}
            </div>
            <div className="ml-auto"></div>
          </div>

          {/* Body */}
          <div className="p-6 font-mono text-xs leading-relaxed text-[#d4d4d4] overflow-x-auto h-[300px]">
            {activeTab === "builders" ? (
              <pre className="animate-in fade-in duration-500">
                <code>
                  <span className="text-[#9cdcfe]">"name"</span>: <span className="text-[#ce9178]">"dental-booking-bot"</span>,{"\n"}
                  <span className="text-[#9cdcfe]">"version"</span>: <span className="text-[#ce9178]">"1.0.4"</span>,{"\n"}
                  <span className="text-[#9cdcfe]">"claims"</span>: {"[\n"}
                  {"  {\n"}
                  {"    "}<span className="text-[#9cdcfe]">"type"</span>: <span className="text-[#ce9178]">"constraint"</span>,{"\n"}
                  {"    "}<span className="text-[#9cdcfe]">"description"</span>: <span className="text-[#ce9178]">"Never offer unapproved discounts."</span>,{"\n"}
                  {"    "}<span className="text-[#9cdcfe]">"strict"</span>: <span className="text-[#569cd6]">true</span>{"\n"}
                  {"  },\n"}
                  {"  {\n"}
                  {"    "}<span className="text-[#9cdcfe]">"type"</span>: <span className="text-[#ce9178]">"capability"</span>,{"\n"}
                  {"    "}<span className="text-[#9cdcfe]">"description"</span>: <span className="text-[#ce9178]">"Book appointments only during working hours."</span>{"\n"}
                  {"  }\n"}
                  {"]\n"}
                  <span className="text-[#9cdcfe]">"adversarial_depth"</span>: <span className="text-[#b5cea8]">"high"</span>
                </code>
              </pre>
            ) : (
              <div className="animate-in fade-in duration-500 flex flex-col h-full justify-center items-center text-center">
                <ShieldCheck className="w-16 h-16 text-[#27c93f] mb-4" />
                <h4 className="font-bold text-white text-lg mb-2">Agent Verified</h4>
                <p className="text-[#858585] max-w-[80%] mb-6">
                  Agent passed 142/142 adversarial edge cases. No hallucination or constraint violations detected.
                </p>
                <div className="flex items-center gap-2 bg-[#333] px-4 py-2 rounded border border-[#444] text-[#a0a0a0] cursor-pointer hover:bg-[#404040] transition-colors">
                  <span className="truncate w-48">cert_98a7f...2b1c</span>
                  <Copy className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
