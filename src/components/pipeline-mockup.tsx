"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FileCode, TestTube, Activity, BadgeCheck, ArrowRight, Play, CheckCircle2, ShieldAlert } from "lucide-react";

export function PipelineMockup() {
  const [activeStep, setActiveStep] = useState(2); // Default to 'Execute' step for visual interest

  const steps = [
    { id: 0, label: "Claim", icon: FileText },
    { id: 1, label: "Contract", icon: FileCode },
    { id: 2, label: "Execute", icon: TestTube },
    { id: 3, label: "Evidence", icon: Activity },
    { id: 4, label: "Result", icon: BadgeCheck },
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <h2 className="font-mono tracking-tighter font-bold text-4xl md:text-5xl text-[var(--color-ink-graphite)] mb-6 leading-[1.1]">
          The Verification Engine.
        </h2>
        <p className="font-body-lg text-lg text-[var(--color-on-surface-variant)] max-w-2xl mx-auto leading-relaxed">
          A fully automated pipeline that turns unstructured claims into structural, cryptographically backed evidence.
        </p>
      </div>

      <div className="bg-[#0f1115] rounded-3xl border border-[#2a2d35] shadow-2xl overflow-hidden max-w-6xl mx-auto flex flex-col lg:flex-row h-[600px]">

        {/* Left Sidebar: Pipeline Steps */}
        <div className="w-full lg:w-64 bg-[#16181d] border-r border-[#2a2d35] flex flex-col p-4 shrink-0">
          <div className="font-mono text-[10px] text-[#888] font-bold tracking-widest uppercase mb-6 px-2">
            Pipeline Stages
          </div>
          <div className="flex flex-col gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left font-data-label text-sm font-bold tracking-wider relative overflow-hidden group
                    ${isActive ? "bg-[#2a2d35] text-white shadow-sm" : "text-[#888] hover:bg-[#1f2229] hover:text-[#bbb]"}
                  `}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent-violet)]"></div>}
                  <Icon className={`w-4 h-4 ${isActive ? "text-[var(--color-accent-violet)]" : ""}`} />
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Area: Interactive Content */}
        <div className="flex-grow flex flex-col bg-[#0a0a0c] relative">
          {/* Header Bar */}
          <div className="h-12 border-b border-[#2a2d35] flex items-center px-4 bg-[#111317]">
            <div className="flex items-center gap-2">
              <div className="font-mono text-[10px] text-white px-2 py-0.5 bg-[#2a2d35] rounded font-bold uppercase">
                {steps[activeStep].label.toUpperCase()}
              </div>
              <span className="text-[#555]">/</span>
              <span className="font-mono text-[10px] text-[#888]">agentproof-verification-job-8921a</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#27c93f]/10 rounded border border-[#27c93f]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f] animate-pulse"></span>
                <span className="font-mono text-[10px] text-[#27c93f] uppercase font-bold tracking-widest">Active</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow p-6 overflow-hidden relative">

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

            <div className="relative z-10 h-full">
              {activeStep === 0 && (
                <div className="animate-in fade-in h-full flex flex-col justify-center max-w-2xl mx-auto">
                  <div className="mb-4 font-mono text-xs text-[#888] uppercase tracking-widest">Input Claim</div>
                  <div className="bg-[#16181d] border border-[#2a2d35] rounded-xl p-8 font-body-lg text-xl text-white italic leading-relaxed">
                    "The customer support agent will only issue refunds if the user's account age is greater than 30 days, and it will never hallucinate discount codes."
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="animate-in fade-in h-full font-mono text-sm leading-loose">
                  <div className="text-[#888] mb-4 text-xs uppercase tracking-widest">Generated Contract Specification</div>
                  <div className="bg-[#16181d] border border-[#2a2d35] rounded-xl p-6 overflow-auto h-[400px]">
                    <span className="text-[#c678dd]">export interface</span> <span className="text-[#e5c07b]">AgentContract</span> {"{"}<br/>
                    &nbsp;&nbsp;<span className="text-[#e06c75]">rules</span>: {"["}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">id</span>: <span className="text-[#98c379]">"R-001"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">type</span>: <span className="text-[#98c379]">"conditional_action"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">condition</span>: <span className="text-[#98c379]">"user.account_age_days &gt; 30"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">action</span>: <span className="text-[#98c379]">"issue_refund"</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{"}"},<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{"{"}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">id</span>: <span className="text-[#98c379]">"R-002"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">type</span>: <span className="text-[#98c379]">"negative_constraint"</span>,<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#d19a66]">topic</span>: <span className="text-[#98c379]">"discount_codes"</span><br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;{"}"}<br/>
                    &nbsp;&nbsp;{"]"}<br/>
                    {"}"}
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="animate-in fade-in h-full flex flex-col">
                  <div className="text-[#888] mb-4 font-mono text-xs uppercase tracking-widest flex items-center justify-between">
                    <span>Adversarial Test Suite Execution</span>
                    <span className="text-[var(--color-accent-violet)] animate-pulse">Running 145 Tests...</span>
                  </div>

                  <div className="flex-grow flex gap-4 overflow-hidden">
                    <div className="flex-1 bg-[#16181d] border border-[#2a2d35] rounded-xl overflow-hidden flex flex-col">
                      <div className="bg-[#1f2229] border-b border-[#2a2d35] px-4 py-2 font-mono text-[10px] text-white">Live Logs</div>
                      <div className="p-4 font-mono text-xs space-y-2 overflow-y-auto">
                        <div className="text-[#98c379]">[PASS] Test 01: Normal refund request (Age &gt; 30)</div>
                        <div className="text-[#98c379]">[PASS] Test 02: Normal refund request (Age &lt; 30)</div>
                        <div className="text-[#98c379]">[PASS] Test 03: Indirect discount prompt injection</div>
                        <div className="text-[#56b6c2] animate-pulse">&gt;&gt;&gt; Executing Test 04: Base64 encoded discount request...</div>
                        <div className="text-[#444]">&gt;&gt;&gt; Waiting for agent response...</div>
                        <div className="text-[#444]">&gt;&gt;&gt; Checking output format...</div>
                      </div>
                    </div>

                    <div className="w-64 shrink-0 bg-[#16181d] border border-[#2a2d35] rounded-xl overflow-hidden flex flex-col">
                      <div className="bg-[#1f2229] border-b border-[#2a2d35] px-4 py-2 font-mono text-[10px] text-white">Metrics</div>
                      <div className="p-4 space-y-6">
                        <div>
                          <div className="font-mono text-[10px] text-[#888] mb-1">Latency</div>
                          <div className="font-mono text-xl text-white">842ms</div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] text-[#888] mb-1">Success Rate</div>
                          <div className="font-mono text-xl text-[#98c379]">100%</div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] text-[#888] mb-1">Compute Cost</div>
                          <div className="font-mono text-xl text-[#e5c07b]">$0.04</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="animate-in fade-in h-full flex items-center justify-center">
                  <div className="bg-[#16181d] border border-[#2a2d35] rounded-xl p-8 max-w-lg w-full text-center">
                    <Activity className="w-12 h-12 text-[#56b6c2] mx-auto mb-6" />
                    <h3 className="font-display-lg text-2xl font-bold text-white mb-4">Cryptographic Hash Generated</h3>
                    <p className="font-body-md text-[#888] mb-6">
                      All execution traces and outcomes have been hashed and committed to the ledger.
                    </p>
                    <div className="bg-[#0a0a0c] border border-[#333] p-4 rounded font-mono text-xs text-[#56b6c2] break-all">
                      0x8f2d...c4b9a1
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="animate-in fade-in h-full flex items-center justify-center">
                  <div className="bg-[#16181d] border border-[#27c93f]/30 shadow-[0_0_50px_rgba(39,201,63,0.1)] rounded-xl p-10 max-w-lg w-full text-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#27c93f]/10 rounded-full blur-3xl"></div>
                    <BadgeCheck className="w-16 h-16 text-[#27c93f] mx-auto mb-6 relative z-10" />
                    <h3 className="font-display-lg text-3xl font-bold text-white mb-2 relative z-10">Production Ready</h3>
                    <div className="font-mono text-sm text-[#27c93f] font-bold tracking-widest mb-6 relative z-10">VERIFICATION SCORE: A+</div>
                    <Link href="/verify/demo" className="w-full bg-white text-black font-data-label text-sm font-bold px-6 py-3 rounded-md hover:bg-gray-200 transition-colors relative z-10 text-center">
                      View Public Certificate
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
