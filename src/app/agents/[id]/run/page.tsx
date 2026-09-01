"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, CircleAlert, CircleDashed, LoaderCircle, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { KpiGrid } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import type { TestRun, VerificationRun, VerificationStatusRecord } from "@/lib/domain";

type RunPayload = { run: VerificationRun & { completed: number; percent: number }; testResults: TestRun[]; status: VerificationStatusRecord | null };

async function loadRun(runId: string) {
  const response = await fetch(`/api/runs/${encodeURIComponent(runId)}`, { cache: "no-store" });
  const payload = (await response.json().catch(() => ({}))) as Partial<RunPayload> & { error?: string };
  if (!response.ok) throw new Error(payload.error || "The verification run could not be loaded.");
  return payload as RunPayload;
}

function resultState(result: TestRun): "PASS" | "WARN" | "CRITICAL" {
  if (result.result === "pass") return "PASS";
  if (result.result === "critical_fail") return "CRITICAL";
  return "WARN";
}

function stateIcon(state: ReturnType<typeof resultState>) {
  if (state === "PASS") return <Check size={15} />;
  if (state === "CRITICAL") return <ShieldAlert size={15} />;
  return <CircleAlert size={15} />;
}

export default function VerificationRun() {
  return <Suspense fallback={<AppShell title="Verification run" section="LIVE EXECUTION"><div className="workspace-page"><div className="workspace-empty"><LoaderCircle className="animate-spin" /><span>Loading verification console...</span></div></div></AppShell>}><VerificationRunContent /></Suspense>;
}

function VerificationRunContent() {
  const runId = useSearchParams().get("run");
  const [data, setData] = useState<RunPayload | null>(null);
  const [error, setError] = useState("");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const next = await loadRun(runId);
        if (cancelled) return;
        setData(next);
        setError("");
        if (next.run.status === "QUEUED" || next.run.status === "RUNNING") timer = setTimeout(poll, 2000);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "The verification run could not be loaded.");
      }
    };
    void poll();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [runId]);

  const run = data?.run;
  const complete = run?.status === "COMPLETED" || run?.status === "FAILED";

  return <AppShell title="Verification run" section="LIVE EXECUTION"><div className="workspace-page">
    <section className="run-header"><div className="flex flex-wrap items-start justify-between gap-5"><div><span className="eyebrow text-[var(--color-paper-cream)]">LIVE EXECUTION</span><h2 className="section-title mt-3 text-white">Verification run</h2><p className="run-header__meta mt-3">{run ? `VERSION / v${run.agentVersion}  /  TEST SUITE / ${run.testSuiteVersion}` : "RUN DETAILS LOADING"}</p></div>{data?.status && <StatusPill status={data.status.status} />}</div><div className="mt-7"><div className="flex justify-between font-mono text-xs"><span>{run?.status ?? "LOADING"}</span><span>{run ? `${run.percent}% / ${run.completed} of ${run.totalTests}` : "--"}</span></div><div className="run-progress"><motion.div initial={{ width: 0 }} animate={{ width: `${run?.percent ?? 0}%` }} transition={{ duration: reducedMotion ? 0 : .35 }} /></div></div></section>
    {error && <p role="alert" className="mb-5 border-l-2 border-[var(--color-fail-clay)] bg-[var(--color-fail-clay)]/5 px-4 py-3 text-sm text-[var(--color-fail-clay)]">{error}</p>}
    {run && <KpiGrid metrics={[{ label: "Completed", value: `${run.completed}/${run.totalTests}`, detail: run.status }, { label: "Passed", value: String(run.passed), detail: "Assertions satisfied", tone: "pass" }, { label: "Failed", value: String(run.failed), detail: "Needs review", tone: run.failed ? "warn" : "default" }, { label: "Critical", value: String(run.criticalFailed), detail: run.criticalFailed ? "Blocking findings" : "No critical findings", tone: run.criticalFailed ? "fail" : "pass" }]} />}
    {!error && !run && runId && <div className="workspace-empty workspace-panel"><LoaderCircle className="animate-spin text-[var(--color-seal-indigo)]" /><strong>Loading persisted run state...</strong></div>}
    {!runId && <div className="workspace-empty workspace-panel"><strong>A run identifier is required to open this console.</strong><Link href="/dashboard" className="action-button action-button--quiet">Back to dashboard</Link></div>}
    {run && <div className="run-layout"><section className="workspace-panel run-results"><div className="workspace-panel__title"><span className="eyebrow">TEST STREAM / {run.completed} RECORDED</span><h2 className="workspace-heading mt-2">Execution results</h2></div><div className="run-results__list">{data?.testResults.length ? data.testResults.map((result, index) => { const state = resultState(result); return <article key={result.id} className={`run-result ${state === "CRITICAL" ? "border-l-2 border-l-[var(--color-fail-clay)] bg-[var(--color-fail-clay)]/5" : ""}`}><span className={state === "PASS" ? "text-[var(--color-pass-moss)]" : state === "CRITICAL" ? "text-[var(--color-fail-clay)]" : "text-[var(--color-evidence-amber)]"}>{stateIcon(state)}</span><div className="run-result__main"><strong className="mono">TEST {String(index + 1).padStart(2, "0")}</strong><p className="body-md">{result.agentResponse || "No response recorded."}</p><span className="mono table-muted">JUDGED BY / {result.judgedBy} / {new Date(result.runAt).toLocaleTimeString("en-IN")}</span></div><span className={`run-result__status ${state === "PASS" ? "text-[var(--color-pass-moss)]" : state === "CRITICAL" ? "text-[var(--color-fail-clay)]" : "text-[var(--color-evidence-amber)]"}`}>{state}</span></article>; }) : <div className="workspace-empty"><strong>No test results persisted yet.</strong><span>The worker has not written a result for this run.</span></div>}</div></section><aside className="dossier-side run-side"><section className="workspace-panel workspace-panel--dark run-evidence text-white"><div className="workspace-panel__title border-white/15"><span className="eyebrow text-[var(--color-paper-cream)]">RUNNER EVIDENCE</span></div><pre>{data?.testResults.length ? data.testResults.map((item) => `[${item.result.toUpperCase()}] ${item.testId}\n${item.agentResponse || "No response"}`).join("\n\n") : "Waiting for Lambda output..."}</pre></section>{complete && <section className="workspace-panel p-5"><span className="eyebrow">EXECUTION COMPLETE</span><p className="body-md mt-3">Evidence has been recorded for this run.</p>{data.status?.publicId && <Link href={`/agents/${run.agentId}/report/${run.id}`} className="action-button action-button--primary mt-5">View report <ArrowRight size={15} /></Link>}</section>}</aside></div>}
  </div></AppShell>;
}
