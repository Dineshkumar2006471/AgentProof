"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Play, RefreshCw } from "lucide-react";

type RunTriggerButtonProps = {
  agentId: string;
  contractId?: string;
  label?: string;
  variant?: "primary" | "dark" | "quiet" | "danger";
  icon?: "play" | "refresh" | "arrow" | "none";
  className?: string;
};

export function RunTriggerButton({
  agentId,
  contractId,
  label = "Run verification",
  variant = "primary",
  icon = "play",
  className = ""
}: RunTriggerButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTrigger() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/agents/${encodeURIComponent(agentId)}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contractId ? { contractId } : {})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Verification failed to start (HTTP ${response.status})`);
      }
      if (!data.run?.id) {
        throw new Error("No run identifier returned by verification runner.");
      }
      router.push(`/agents/${encodeURIComponent(agentId)}/run?run=${encodeURIComponent(data.run.id)}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Verification could not be started.";
      setError(message);
      setBusy(false);
    }
  }

  const baseClass = "action-button inline-flex items-center justify-center gap-2 font-body-md text-sm transition-colors border cursor-pointer";
  let variantClass = "";
  if (variant === "primary") {
    variantClass = "bg-[var(--color-seal-indigo)] text-white border-[var(--color-seal-indigo)] hover:bg-[var(--color-ink-graphite)] hover:border-[var(--color-ink-graphite)]";
  } else if (variant === "dark") {
    variantClass = "bg-[var(--color-ink-graphite)] text-white border-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-variant)]";
  } else if (variant === "danger") {
    variantClass = "bg-[var(--color-fail-clay)] text-white border-[var(--color-fail-clay)] hover:bg-red-700";
  } else {
    variantClass = "bg-transparent text-[var(--color-ink-graphite)] border-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-variant)]";
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={handleTrigger}
        className={`${baseClass} ${variantClass} ${busy ? "opacity-70 pointer-events-none" : ""} ${className}`}
      >
        {busy ? (
          <>
            <LoaderCircle size={15} className="animate-spin" />
            <span>Starting run...</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            {icon === "play" && <Play size={14} className="fill-current" />}
            {icon === "refresh" && <RefreshCw size={14} />}
            {icon === "arrow" && <ArrowRight size={14} />}
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-[var(--color-fail-clay)] max-w-xs mt-1 block">
          {error}
        </span>
      )}
    </div>
  );
}
