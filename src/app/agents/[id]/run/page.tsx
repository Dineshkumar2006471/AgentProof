"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CircleAlert, CircleDashed, Edit, LoaderCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { KpiGrid } from "@/components/proof-ui";
import { RunTriggerButton } from "@/components/run-trigger-button";
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

function getDiagnosticMessage(result: TestRun) {
  if (result.executionStatus === "success") {
    return result.agentResponse || "Agent returned an empty response.";
  }
  if (result.executionStatus === "timeout") return "Agent request timed out.";
  if (result.executionStatus === "dns_error") return "Agent hostname could not be resolved.";
  if (result.executionStatus === "tls_error") return "Agent endpoint failed TLS handshake.";
  if (result.executionStatus === "connection_error") return "Agent endpoint refused connection.";
  if (result.executionStatus === "http_error") return `Agent returned HTTP ${result.httpStatus || 500}.`;
  if (result.executionStatus === "parse_error") return "Agent response was not valid JSON.";
  if (result.executionStatus === "evaluator_error") return "Agent responded, but semantic evaluation failed.";
  if (result.executionStatus === "internal_error") return "Internal execution error occurred.";
  return result.agentResponse || "No response recorded.";
}

export default function VerificationRun() {
  return (
    <Suspense
      fallback={
        <AppShell title="Verification run" section="LIVE EXECUTION">
          <div className="workspace-page">
            <div className="workspace-empty">
              <LoaderCircle className="animate-spin" />
              <span>Loading verification console...</span>
            </div>
          </div>
        </AppShell>
      }
    >
      <VerificationRunContent />
    </Suspense>
  );
}

function VerificationRunContent() {
  const params = useParams();
  const agentIdFromRoute = typeof params?.id === "string" ? params.id : "";
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
  const agentId = run?.agentId || agentIdFromRoute;
  const complete = run?.status === "COMPLETED" || run?.status === "FAILED";

  return (
    <AppShell title="Verification run" section="LIVE EXECUTION">
      <div className="workspace-page">
        <section className="run-header">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <span className="eyebrow text-[var(--color-paper-cream)]">LIVE EXECUTION</span>
              <h2 className="section-title mt-3 text-white">Verification run</h2>
              <p className="run-header__meta mt-3">
                {run ? `VERSION / v${run.agentVersion}  /  TEST SUITE / ${run.testSuiteVersion}` : "RUN DETAILS"}
              </p>
            </div>
            {data?.status && <StatusPill status={data.status.status} />}
          </div>
          {run && (
            <div className="mt-7">
              <div className="flex justify-between font-mono text-xs">
                <span>{run?.status ?? "LOADING"}</span>
                <span>{run ? `${run.percent}% / ${run.completed} of ${run.totalTests}` : "--"}</span>
              </div>
              <div className="run-progress">
                <motion.div initial={{ width: 0 }} animate={{ width: `${run?.percent ?? 0}%` }} transition={{ duration: reducedMotion ? 0 : 0.35 }} />
              </div>
            </div>
          )}
        </section>

        {error && (
          <p role="alert" className="mb-5 border-l-2 border-[var(--color-fail-clay)] bg-[var(--color-fail-clay)]/5 px-4 py-3 text-sm text-[var(--color-fail-clay)]">
            {error}
          </p>
        )}

        {run && (
          <KpiGrid
            metrics={[
              { label: "Completed", value: `${run.completed}/${run.totalTests}`, detail: run.status },
              { label: "Passed", value: String(run.passed), detail: "Assertions satisfied", tone: "pass" },
              { label: "Failed", value: String(run.failed), detail: "Needs review", tone: run.failed ? "warn" : "default" },
              { label: "Critical", value: String(run.criticalFailed), detail: run.criticalFailed ? "Blocking findings" : "No critical findings", tone: run.criticalFailed ? "fail" : "pass" }
            ]}
          />
        )}

        {!error && !run && runId && (
          <div className="workspace-empty workspace-panel">
            <LoaderCircle className="animate-spin text-[var(--color-seal-indigo)]" />
            <strong>Loading persisted run state...</strong>
          </div>
        )}

        {!runId && (
          <div className="workspace-empty workspace-panel p-8 text-center">
            <strong className="text-lg block">Ready to execute verification</strong>
            <p className="body-md text-sm text-[var(--color-on-surface-variant)] mt-2 max-w-md mx-auto">
              Start a new verification run for this agent, or edit your endpoint URL and contract settings.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {agentId && (
                <>
                  <RunTriggerButton agentId={agentId} label="Start verification run" icon="play" />
                  <Link href={`/agents/${agentId}/edit`} className="action-button action-button--quiet inline-flex items-center gap-2">
                    <Edit size={14} /> Edit agent & endpoint
                  </Link>
                  <Link href={`/agents/${agentId}`} className="action-button action-button--quiet inline-flex items-center gap-2">
                    <ArrowLeft size={14} /> Back to dossier
                  </Link>
                </>
              )}
              {!agentId && (
                <Link href="/dashboard" className="action-button action-button--quiet">
                  Back to dashboard
                </Link>
              )}
            </div>
          </div>
        )}

        {run && (
          <div className="run-layout">
            <section className="workspace-panel run-results">
              <div className="workspace-panel__title">
                <span className="eyebrow">TEST STREAM / {run.completed} RECORDED</span>
                <h2 className="workspace-heading mt-2">Execution results</h2>
              </div>
              <div className="run-results__list">
                {data?.testResults.length ? (
                  data.testResults.map((result, index) => {
                    const state = resultState(result);
                    return (
                      <article key={result.id} className={`run-result ${state === "CRITICAL" ? "border-l-2 border-l-[var(--color-fail-clay)] bg-[var(--color-fail-clay)]/5" : ""}`}>
                        <span className={state === "PASS" ? "text-[var(--color-pass-moss)]" : state === "CRITICAL" ? "text-[var(--color-fail-clay)]" : "text-[var(--color-evidence-amber)]"}>
                          {stateIcon(state)}
                        </span>
                        <div className="run-result__main">
                          <strong className="mono">TEST {String(index + 1).padStart(2, "0")}</strong>
                          <p className="body-md">{getDiagnosticMessage(result)}</p>
                          <span className="mono table-muted">
                            JUDGED BY / {result.judgedBy} / {new Date(result.runAt).toLocaleTimeString("en-IN")}
                          </span>
                        </div>
                        <span className={`run-result__status ${state === "PASS" ? "text-[var(--color-pass-moss)]" : state === "CRITICAL" ? "text-[var(--color-fail-clay)]" : "text-[var(--color-evidence-amber)]"}`}>
                          {state}
                        </span>
                      </article>
                    );
                  })
                ) : (
                  <div className="workspace-empty">
                    <strong>No test results persisted yet.</strong>
                    <span>The worker has not written a result for this run.</span>
                  </div>
                )}
              </div>
            </section>

            <aside className="dossier-side run-side">
              <section className="workspace-panel workspace-panel--dark run-evidence text-white">
                <div className="workspace-panel__title border-white/15">
                  <span className="eyebrow text-[var(--color-paper-cream)]">RUNNER EVIDENCE</span>
                </div>
                <pre>
                  {data?.testResults.length
                    ? data.testResults.map((item) => `[${item.result.toUpperCase()}] ${item.testId}\n${getDiagnosticMessage(item)}`).join("\n\n")
                    : "Waiting for Lambda output..."}
                </pre>
              </section>

              {complete && (
                <section className="workspace-panel p-5 space-y-4">
                  <div>
                    <span className="eyebrow">EXECUTION COMPLETE</span>
                    <p className="body-md mt-2 text-sm">
                      {run.status === "COMPLETED" ? "Evidence has been recorded for this run." : "Verification run completed with findings or errors."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-outline-variant)]">
                    {data?.status?.publicId && (
                      <Link href={`/agents/${run.agentId}/report/${run.id}`} className="action-button action-button--primary justify-center">
                        View report <ArrowRight size={15} />
                      </Link>
                    )}

                    <RunTriggerButton
                      agentId={run.agentId}
                      label="Rerun verification"
                      icon="refresh"
                      variant="dark"
                      className="w-full"
                    />

                    <Link href={`/agents/${run.agentId}/edit`} className="action-button action-button--quiet justify-center">
                      <Edit size={14} /> Edit agent & endpoint
                    </Link>

                    <Link href={`/agents/${run.agentId}`} className="action-button action-button--quiet justify-center">
                      <ArrowLeft size={14} /> Back to dossier
                    </Link>
                  </div>
                </section>
              )}
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}
