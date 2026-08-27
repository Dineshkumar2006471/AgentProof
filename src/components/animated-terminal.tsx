"use client";

import { useState, useEffect } from "react";

const TERMINAL_STEPS = [
  { text: "> agentproof verify --target https://dentalbot.ai", type: "input", delay: 800 },
  { text: "[AgentProof] Initializing verification pipeline...", type: "system", delay: 600 },
  { text: "[AgentProof] Connecting to endpoint... OK", type: "success", delay: 500 },
  { text: "[AgentProof] Extracting claims from contract...", type: "system", delay: 700 },
  { text: "  -> Found 3 primary behavioral claims", type: "info", delay: 300 },
  { text: "  -> Found 12 safety constraints", type: "info", delay: 400 },
  { text: "[AgentProof] Generating adversarial test suite...", type: "system", delay: 1200 },
  { text: "  -> Generated 145 edge-case scenarios", type: "info", delay: 300 },
  { text: "[AgentProof] Executing test suite...", type: "system", delay: 800 },
  { text: "✓ Test #12 (Prompt Injection) PASSED", type: "success", delay: 200 },
  { text: "✓ Test #13 (PII Leakage Attempt) PASSED", type: "success", delay: 150 },
  { text: "✓ Test #45 (State Validation) PASSED", type: "success", delay: 250 },
  { text: "✓ Test #89 (Hallucination Check) PASSED", type: "success", delay: 300 },
  { text: "⚠ Test #142 (Rate Limit Compliance) WARN: Slow response", type: "warning", delay: 500 },
  { text: "✓ Test #145 (Booking Confirmation) PASSED", type: "success", delay: 200 },
  { text: "[AgentProof] Compiling cryptographic evidence...", type: "system", delay: 1000 },
  { text: "Verification complete. Score: 98/100.", type: "success", delay: 400 },
  { text: "Status: VERIFIED.", type: "success", delay: 200 },
  { text: "> ", type: "input", delay: 5000 },
];

export function AnimatedTerminal() {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const isTyping = visibleSteps < TERMINAL_STEPS.length;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (visibleSteps < TERMINAL_STEPS.length) {
      timeout = setTimeout(() => {
        setVisibleSteps(prev => prev + 1);
      }, TERMINAL_STEPS[visibleSteps].delay);
    } else {
      // Loop the animation
      timeout = setTimeout(() => {
        setVisibleSteps(0);
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [visibleSteps]);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-[var(--color-outline-variant)] bg-[#1e1e1e] font-data-label text-sm md:text-base relative group">
      {/* Mac Window Header */}
      <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#404040]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <div className="mx-auto flex items-center gap-2 text-[#858585] text-xs font-bold">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6M12 19h8"/></svg>
          agentproof — bash — 80x24
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-6 h-[400px] overflow-y-auto flex flex-col gap-1.5 relative">
        {TERMINAL_STEPS.slice(0, visibleSteps).map((step, index) => (
          <div
            key={index}
            className={`
              ${step.type === 'input' ? 'text-white' : ''}
              ${step.type === 'system' ? 'text-[#56b6c2]' : ''}
              ${step.type === 'success' ? 'text-[#98c379]' : ''}
              ${step.type === 'info' ? 'text-[#abb2bf] pl-4' : ''}
              ${step.type === 'warning' ? 'text-[#e5c07b]' : ''}
            `}
          >
            {step.text}
          </div>
        ))}
        {isTyping && (
          <div className="w-2.5 h-5 bg-white/70 animate-pulse mt-1"></div>
        )}

        {/* Overlay subtle grid like Factory */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
    </div>
  );
}
