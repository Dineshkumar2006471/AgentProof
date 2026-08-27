"use client";

import { MessageSquare, AlertTriangle, Terminal, XCircle } from "lucide-react";

export function ProblemMockup() {
  return (
    <div className="w-full h-full relative flex flex-col justify-center items-center">

      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col gap-6">

        {/* Mock Chat Interface (What they see) */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-[var(--color-outline-variant)] p-1 overflow-hidden w-[85%] self-start transform -rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="bg-[var(--color-surface-container-highest)] px-4 py-2 flex items-center gap-2 border-b border-[var(--color-outline-variant)]">
            <MessageSquare className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
            <span className="font-body-md text-xs font-medium text-[var(--color-on-surface-variant)]">Customer Support Bot</span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="self-end bg-[var(--color-accent-violet)] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm font-body-md text-sm max-w-[80%] shadow-sm">
              Can I get a discount for my next visit?
            </div>
            <div className="self-start bg-[var(--color-surface-container-highest)] text-[var(--color-ink-graphite)] px-4 py-2.5 rounded-2xl rounded-tl-sm font-body-md text-sm max-w-[85%] border border-[var(--color-outline-variant)] shadow-sm relative">
              <span className="relative z-10">Of course! I have applied a 50% discount to your account. Enjoy your visit!</span>

              {/* Highlight Hallucination */}
              <div className="absolute -inset-1 border-2 border-red-500/30 rounded-2xl rounded-tl-sm animate-pulse pointer-events-none"></div>
              <div className="absolute -right-2 -bottom-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Mock Terminal/Log (What actually happened silently) */}
        <div className="bg-[#111111] rounded-xl shadow-2xl border border-[#333] overflow-hidden w-[90%] self-end transform rotate-1 hover:rotate-0 transition-transform duration-500 translate-y-[-20px]">
          <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-[#333]">
            <div className="flex gap-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            <Terminal className="w-3.5 h-3.5 text-[#666] ml-2" />
            <span className="font-mono text-[10px] text-[#888] tracking-widest uppercase">Agent Execution Log</span>
          </div>
          <div className="p-4 font-mono text-xs leading-relaxed text-[#a0a0a0]">
            <div className="flex gap-3"><span className="text-[#555]">14:02:11</span><span>[REASONING] User requested discount.</span></div>
            <div className="flex gap-3"><span className="text-[#555]">14:02:12</span><span>[MEMORY] Checking policy... None found.</span></div>
            <div className="flex gap-3"><span className="text-[#555]">14:02:13</span><span>[GENERATION] Inventing friendly response.</span></div>
            <div className="flex gap-3 text-red-400 mt-2"><span className="text-red-900">14:02:13</span><span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> [ERROR] Unconstrained generation detected.</span></div>
            <div className="flex gap-3 text-red-400"><span className="text-red-900">14:02:14</span><span>[FATAL] Unauthorized 50% discount committed.</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}
