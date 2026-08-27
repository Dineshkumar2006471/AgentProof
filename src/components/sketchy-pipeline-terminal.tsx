"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, FileJson, Play, Box } from "lucide-react";

const PIPELINE_STEPS = [
  { id: "ingest", label: "INGEST", icon: Box },
  { id: "contract", label: "GENERATE", icon: FileJson },
  { id: "execute", label: "EXECUTE", icon: Play },
  { id: "verify", label: "VERIFY", icon: CheckCircle2 },
];

export function SketchyPipelineTerminal() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-[var(--color-outline-variant)] bg-[#1e1e1e] font-data-label text-sm relative group h-[400px] flex flex-col">
      {/* Mac Window Header */}
      <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#404040]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <div className="mx-auto flex items-center gap-2 text-[#858585] text-xs font-bold font-mono tracking-widest uppercase">
          agentproof-flow
        </div>
      </div>

      {/* Terminal Content - Sketchy Flow Diagram */}
      <div className="flex-grow p-8 flex items-center justify-center bg-[#1e1e1e] text-[#a0a0a0] font-mono relative overflow-hidden">

        {/* Faint Background Grid / Ascii texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#404040 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">
          <div className="flex items-center justify-between w-full mb-12 relative px-4">

            {/* Connection Line */}
            <div className="absolute top-1/2 left-12 right-12 h-[2px] bg-[#333] -translate-y-1/2 -z-10">
              {/* Animated Progress Line */}
              <div
                className="h-full bg-white transition-all duration-1000 ease-in-out"
                style={{
                  width: `${(activeStepIndex / (PIPELINE_STEPS.length - 1)) * 100}%`,
                  boxShadow: "0 0 10px rgba(255,255,255,0.5)"
                }}
              />
            </div>

            {/* Nodes */}
            {PIPELINE_STEPS.map((step, index) => {
              const isActive = index === activeStepIndex;
              const isPast = index < activeStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center gap-4 relative">
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-all duration-500 border-2
                      ${isActive ? "bg-white text-[#1e1e1e] border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]" :
                        isPast ? "bg-[#333] text-white border-[#555]" :
                        "bg-[#222] text-[#555] border-[#333]"}
                    `}
                  >
                    <Icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  {/* Label */}
                  <div className={`text-[10px] md:text-xs font-bold tracking-widest transition-colors duration-500 ${isActive ? "text-white" : isPast ? "text-[#a0a0a0]" : "text-[#555]"}`}>
                    {step.label}
                  </div>

                  {/* Activity Indicators */}
                  {isActive && (
                    <div className="absolute -bottom-6 flex items-center gap-1">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Simple Code Snippet / Ascii output area */}
          <div className="w-full bg-[#151515] rounded border border-[#333] p-4 text-[10px] md:text-xs mt-8 font-mono overflow-x-hidden">
            <div className="flex gap-4">
              <span className="text-[#555]">01</span>
              <span className={activeStepIndex === 0 ? "text-white" : "text-[#555]"}>
                {">"} load_agent_claims(source="manifest.json")
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-[#555]">02</span>
              <span className={activeStepIndex === 1 ? "text-white" : "text-[#555]"}>
                {">"} generate_strict_contract(depth="exhaustive")
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-[#555]">03</span>
              <span className={activeStepIndex === 2 ? "text-white" : "text-[#555]"}>
                {">"} exec_adversarial_suite(threads=32)
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-[#555]">04</span>
              <span className={activeStepIndex === 3 ? "text-white" : "text-[#555]"}>
                {">"} compile_cryptographic_proof()
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
