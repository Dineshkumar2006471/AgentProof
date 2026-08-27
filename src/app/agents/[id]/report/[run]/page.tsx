import Link from "next/link";
import { ArrowDownToLine, ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import { getAgentForOwner, getRunForOwner, getRunRecords, getVerificationStatus } from "@/lib/aws/dynamodb";
import { requirePageUser } from "@/lib/auth/require-page-user";

type EvidenceRecord = { id: string; severity: string; reproductionInput: string; expectedBehavior: string; actualBehavior?: string; whyItFailed?: string; toolCalls?: unknown[] };

export default async function PrivateReportPage({ params }: { params: Promise<{ id: string; run: string }> }) {
  const { id, run: runId } = await params;
  const user = await requirePageUser(`/agents/${id}/report/${runId}`);
  const [agent, run, status, records] = await Promise.all([getAgentForOwner(id, user.sub), getRunForOwner(runId, user.sub), getVerificationStatus(runId), getRunRecords(runId)]);
  if (!agent || !run || !status) notFound();
  const evidence = records.filter((record) => record.entityType === "Evidence") as unknown as EvidenceRecord[];

  return <AppShell title="Verification report" section="PRIVATE EVIDENCE"><div className="workspace-page">
    <PageHeader eyebrow={`PRIVATE EVIDENCE / ${status.publicId}`} title="Verification report" description={`Builder-facing evidence for ${agent.name} version ${status.agentVersion}.`} actions={<><ActionButton variant="quiet" href={`/api/runs/${runId}/export`} icon={<ArrowDownToLine size={15} />}>Export JSON</ActionButton><ActionButton href={`/verify/${status.publicId}`} icon={<ExternalLink size={15} />}>Public report</ActionButton></>} />
    <section className="workspace-panel report-summary"><div className="flex justify-center"><span className="report-summary__stamp"><StatusPill status={status.status} /></span></div><div><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="eyebrow">AGENTPROOF ATTESTATION</span><h2 className="workspace-heading mt-3">{agent.name}</h2><p className="mono mt-2">VERSION / {status.agentVersion}</p></div><div className="report-summary__score">{status.overallScore}<small>/100</small></div></div><span className="eyebrow mt-5 block">RELIABILITY SCORE</span></div></section>
    <KpiGrid metrics={[{ label: "Last verified", value: status.lastVerified, detail: "Most recent execution" }, { label: "Valid until", value: status.validUntil, detail: "Attestation window" }, { label: "Test scenarios", value: String(status.totalTests), detail: `${status.passed} passed` }, { label: "Checksum", value: `${status.hash.slice(0, 12)}...`, detail: "Integrity reference" }]} />
    <div className="dossier-layout"><section className="workspace-panel workspace-panel--table"><div className="workspace-panel__title"><span className="eyebrow">FULL PRIVATE EVIDENCE</span><h2 className="workspace-heading mt-2">What the runner observed</h2></div>{evidence.length ? <div>{evidence.map((item, index) => <article key={item.id} className="evidence-row"><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-3"><span className="mono">E-{String(index + 1).padStart(2, "0")} / {item.severity.toUpperCase()}</span><StatusPill status={item.severity === "critical" ? "BLOCKED" : item.severity === "info" ? "VERIFIED" : "CONDITIONAL"} /></div><h3 className="mt-3 font-mono text-sm font-bold">{item.reproductionInput}</h3><p className="body-md mt-2"><strong>Expected:</strong> {item.expectedBehavior}</p><p className="body-md mt-1"><strong>Actual:</strong> {item.actualBehavior || "No response recorded."}</p><div className="evidence-detail mt-4"><span>JUDGMENT / {item.whyItFailed || "Assertion satisfied"}</span>{item.toolCalls && <code>{JSON.stringify(item.toolCalls, null, 2)}</code>}</div></div></article>)}</div> : <div className="workspace-empty"><strong>Evidence is still being written.</strong><span>Refresh this report when the worker has completed its write.</span></div>}</section><aside className="dossier-side"><section className="workspace-panel"><div className="workspace-panel__title"><span className="eyebrow">RUN METADATA</span><h2 className="workspace-heading mt-2">Execution record</h2></div><dl className="settings-rows"><div><dt className="eyebrow">RUN ID</dt><dd className="mono">{run.id}</dd></div><div><dt className="eyebrow">TEST SUITE</dt><dd className="mono">{run.testSuiteVersion}</dd></div><div><dt className="eyebrow">STARTED</dt><dd className="mono">{new Date(run.startedAt).toLocaleString("en-IN")}</dd></div><div><dt className="eyebrow">RESULTS</dt><dd className="mono">{run.passed} passed / {run.failed} failed</dd></div></dl></section><Link href={`/agents/${agent.id}`} className="mono inline-flex items-center gap-2 text-[var(--color-seal-indigo)]"><ArrowLeft size={14} /> Back to dossier</Link></aside></div>
  </div></AppShell>;
}
