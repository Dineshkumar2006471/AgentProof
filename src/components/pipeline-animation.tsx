"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Database, FileCode, Search, ShieldAlert, Cpu, Activity, BadgeCheck } from "lucide-react";

const STEPS = [
  { id: 1, name: "Ingestion", icon: Database, color: "text-[var(--color-accent-blue)]", bg: "bg-[var(--color-accent-blue)]/10", border: "border-[var(--color-accent-blue)]/20" },
  { id: 2, name: "Contract Gen", icon: FileCode, color: "text-[var(--color-accent-blue)]", bg: "bg-[var(--color-accent-blue)]/10", border: "border-[var(--color-accent-blue)]/20" },
  { id: 3, name: "Discovery", icon: Search, color: "text-[var(--color-seal-indigo)]", bg: "bg-[var(--color-seal-indigo)]/10", border: "border-[var(--color-seal-indigo)]/20" },
  { id: 4, name: "Adversarial", icon: ShieldAlert, color: "text-[var(--color-accent-orange)]", bg: "bg-[var(--color-accent-orange)]/10", border: "border-[var(--color-accent-orange)]/20" },
  { id: 5, name: "Execution", icon: Cpu, color: "text-[var(--color-seal-indigo)]", bg: "bg-[var(--color-seal-indigo)]/10", border: "border-[var(--color-seal-indigo)]/20" },
  { id: 6, name: "Evidence", icon: Activity, color: "text-[var(--color-pass-moss)]", bg: "bg-[var(--color-pass-moss)]/10", border: "border-[var(--color-pass-moss)]/20" },
  { id: 7, name: "Verified", icon: BadgeCheck, color: "text-[var(--color-pass-moss)]", bg: "bg-[var(--color-pass-moss)]/10", border: "border-[var(--color-pass-moss)]/20" },
];

export function PipelineAnimation() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 7 ? 1 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] bg-[var(--color-ink-graphite)] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group flex flex-col">
      {/* Background Image / "Human Image" */}
      <div className="absolute inset-0 opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-1000">
        <Image
          src="/hero-visual.jpg"
          alt="Agent Evaluation Pipeline"
          fill
          className="object-cover"
        />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink-graphite)] via-[var(--color-ink-graphite)]/80 to-transparent"></div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 p-6 flex justify-between items-center border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--color-fail-clay)]"></div>
          <div className="w-3 h-3 rounded-full bg-[var(--color-evidence-amber)]"></div>
          <div className="w-3 h-3 rounded-full bg-[var(--color-pass-moss)]"></div>
        </div>
        <div className="font-mono text-xs text-white/50 font-medium tracking-widest uppercase">
          Agent Evaluation Pipeline
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative z-10 flex-grow p-8 flex flex-col justify-center">
        <div className="space-y-6">
          {STEPS.map((step) => {
            const isActive = step.id === activeStep;
            const isPast = step.id < activeStep;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isActive ? "scale-105 opacity-100 translate-x-4" : isPast ? "opacity-60" : "opacity-30"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors duration-500 ${
                  isActive || isPast ? step.bg : "bg-white/5"
                } ${isActive || isPast ? step.border : "border-white/10"}`}>
                  <Icon className={`w-6 h-6 ${isActive || isPast ? step.color : "text-white/30"}`} />
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white/40">{step.id}</span>
                    <span className={`font-mono text-sm font-bold tracking-wide uppercase transition-colors duration-500 ${
                      isActive ? "text-white" : "text-white/50"
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {/* Progress Line */}
                  <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-in-out ${
                      isPast ? "w-full" : isActive ? "w-full animate-pulse" : "w-0"
                    } ${
                      step.id <= 2 ? "bg-[var(--color-accent-blue)]" :
                      step.id === 4 ? "bg-[var(--color-accent-orange)]" :
                      step.id >= 6 ? "bg-[var(--color-pass-moss)]" : "bg-[var(--color-seal-indigo)]"
                    }`}></div>
                  </div>
                </div>

                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Status Bar */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center font-mono text-xs text-white/60">
        <div>STATUS: {activeStep === 7 ? <span className="text-[var(--color-pass-moss)] font-bold">VERIFIED</span> : <span className="text-[var(--color-accent-orange)] animate-pulse">PROCESSING...</span>}</div>
        <div>TESTS RUN: {(activeStep * 124).toLocaleString()}</div>
      </div>
    </div>
  );
}
