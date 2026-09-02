import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { KpiGrid, PageHeader } from "@/components/proof-ui";
import { requirePageUser } from "@/lib/auth/require-page-user";
import { getFounderMetrics } from "@/lib/aws/dynamodb";
import { countRegisteredUsers } from "@/lib/aws/cognito-admin";
import { requireFounder } from "@/lib/founder";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Founder analytics", robots: { index: false, follow: false } };

export default async function FounderAnalyticsPage() {
  const user = await requirePageUser("/founder");
  requireFounder(user.sub);
  const [metrics, registeredUsers] = await Promise.all([getFounderMetrics(), countRegisteredUsers()]);
  const mrr = metrics.activeBuilderSubscriptions * 199 + metrics.activeAgencySubscriptions * 499;
  return <AppShell title="FOUNDER ANALYTICS" section="OPERATIONS"><div className="workspace-page"><PageHeader eyebrow="PRIVATE OPERATIONS" title="PRODUCT HEALTH" description="Aggregate operational metrics only. Customer prompts, evidence, endpoints, credentials, names, and email addresses are never shown here." /><KpiGrid metrics={[{ label: "Registered users", value: String(registeredUsers), detail: "Cognito accounts" }, { label: "Agents", value: String(metrics.agents), detail: "Registered deployments" }, { label: "Verification runs", value: String(metrics.verificationRuns), detail: `${metrics.completedRuns} completed`, tone: "pass" }, { label: "Monthly recurring revenue", value: `₹${mrr}`, detail: `${metrics.activeBuilderSubscriptions + metrics.activeAgencySubscriptions} active paid plans`, tone: "pass" }]} /><section className="workspace-panel p-6"><span className="eyebrow">BILLING SIGNALS</span><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><strong className="font-mono text-2xl">{metrics.oneTimePurchases}</strong><p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">Successful payment webhooks recorded.</p></div><div><strong className="font-mono text-2xl text-[var(--color-evidence-amber)]">{metrics.failedPayments}</strong><p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">Failed payment webhooks recorded.</p></div></div></section><section className="mt-6 workspace-panel p-6"><span className="eyebrow">ACQUISITION</span><p className="mt-3 text-sm leading-6 text-[var(--color-on-surface-variant)]">Traffic, acquisition, sign-up, and activation funnels are privacy-minimally measured in PostHog. Use the PostHog project for page views and conversion funnels; this dashboard remains the server-side operational source of truth.</p>{env.NEXT_PUBLIC_POSTHOG_PROJECT_URL && <a className="mt-4 inline-block font-data-label text-sm font-bold text-[var(--color-seal-indigo)]" href={env.NEXT_PUBLIC_POSTHOG_PROJECT_URL} target="_blank" rel="noreferrer">OPEN POSTHOG ANALYTICS</a>}</section></div></AppShell>;
}
