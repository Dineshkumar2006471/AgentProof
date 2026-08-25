"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActionButton, EvidenceLedger, EvidenceRow, PageHeader, ProofPanel, TerminalWindow } from "@/components/proof-ui";

type RunPayload = {
  run: { id: string; status: string; totalTests: number; completed: number; percent: number };
  testResults: Array<{ id: string; testId: string; result: "pass" | "fail" | "critical_fail"; agentResponse?: string; judgedBy?: string }>;
  status?: { publicId?: string; overallScore?: number; status?: string } | null;
};

export default function RunPage() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run");
  const [payload, setPayload] = useState<RunPayload | null>(null);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!runId) return;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch("/api/runs/" + runId, { cache: "no-store" });
        const next = await response.json() as RunPayload & { error?: string };
        if (!response.ok) throw new Error(next.error || "Unable to load verification run.");
        if (!active) return;
        setPayload(next);
        setLogs((current) => current.length ? current : ["Verification run accepted by SQS.", "Waiting for the worker to claim the run.", "Connector contract: POST /run"]);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load verification run.");
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 1500);
    return () => { active = false; window.clearInterval(timer); };
  }, [runId]);

  const results = useMemo(() => payload?.testResults ?? [], [payload?.testResults]);
  const finished = payload?.run.status === "COMPLETED" || payload?.run.status === "FAILED";
  const terminalLines = useMemo(() => {
    const lines = [...logs];
    results.slice(-6).forEach((result) => lines.push("[" + result.result.toUpperCase() + "] " + result.testId + " / judged by " + (result.judgedBy || "runner")));
    if (finished) lines.push("---", "Run " + payload?.run.status + ".", payload?.status?.overallScore !== undefined ? "Reliability score: " + payload.status.overallScore + " / 100" : "No score was issued.");
    return lines;
  }, [finished, logs, payload, results]);

  if (!runId) return <AppShell><div className="product-page"><PageHeader eyebrow="LIVE EXECUTION" title="No run selected" description="Start a verification from an agent contract to open the live execution console." actions={<ActionButton href="/dashboard">Back to registry</ActionButton>} /></div></AppShell>;

  return <AppShell><div className="product-page"><PageHeader eyebrow="LIVE EXECUTION" title={finished ? "Verification complete" : "Verification in progress"} description={"Run " + runId + " · " + (payload?.run.totalTests ?? 0) + " scenarios"} actions={finished && payload?.status?.publicId ? <ActionButton href={"/verify/" + payload.status.publicId}>View verification report</ActionButton> : <span className="status-line"><span>{payload?.run.status ?? "QUEUED"}</span><strong className="tone-pass">{payload?.run.percent ?? 0}%</strong></span>} />{error && <p className="mono tone-fail">{error}</p>}<ProofPanel dark className="run-progress"><div><span>SCENARIOS COMPLETED</span><strong>{payload?.run.completed ?? 0} / {payload?.run.totalTests ?? 0}</strong></div><div><span>RUN STATE</span><strong>{payload?.run.status ?? "QUEUED"}</strong></div><div className="run-progress__bar"><i style={{ width: (payload?.run.percent ?? 0) + "%" }} /></div></ProofPanel><div className="run-grid"><EvidenceLedger title="LIVE SCENARIO STREAM">{results.length ? results.map((result, index) => <EvidenceRow key={result.id} id={"T-" + String(index + 1).padStart(2, "0")} category="EXECUTION" title={result.testId} state={result.result === "critical_fail" ? "CRITICAL" : result.result === "fail" ? "WARN" : "PASS"} detail={result.agentResponse || "Response recorded in private evidence."} />) : <EvidenceRow id="QUEUE" category="RUNNER" title="Waiting for execution evidence" state="RUNNING" detail="The worker will insert one evidence row per test." />}</EvidenceLedger><TerminalWindow>{terminalLines.map((line, index) => <div key={line + "-" + index} className={line.includes("PASS") ? "terminal-pass" : line.includes("score") || line.includes("Run ") ? "terminal-highlight" : ""}>{line}</div>)}</TerminalWindow></div></div></AppShell>;
}
