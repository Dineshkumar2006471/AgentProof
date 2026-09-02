"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import type { PricingPlanId } from "@/lib/pricing";
import { captureAnalytics } from "@/lib/analytics";

type PaidPlanId = Exclude<PricingPlanId, "free">;

export function CheckoutButton({ plan, label, featured = false }: { plan: PaidPlanId; label: string; featured?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function beginCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const result = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error ?? "Checkout could not be started.");
      captureAnalytics("checkout_started", { plan });
      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.");
      setLoading(false);
    }
  }

  return (
    <span className="checkout-action">
      <button type="button" className={`action-button inline-flex items-center justify-center gap-2 font-body-md text-sm transition-colors border ${featured ? "bg-[var(--color-seal-indigo)] text-white border-[var(--color-seal-indigo)] hover:bg-[var(--color-ink-graphite)] hover:border-[var(--color-ink-graphite)]" : "bg-transparent text-[var(--color-ink-graphite)] border-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-variant)]"}`} onClick={beginCheckout} disabled={loading}>
        {loading && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
        {loading ? "STARTING..." : label}
      </button>
      {error && <span className="checkout-action__error" role="alert">{error}</span>}
    </span>
  );
}
