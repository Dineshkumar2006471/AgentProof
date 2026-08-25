import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActionButton, EvidenceLedger, EvidenceRow, PageHeader, ReportMetaGrid, ReportSheet } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import { VerificationStamp } from "@/components/verification-stamp";
import { getAgentForOwner, getRunForOwner, getRunRecords, getVerificationStatus } from "@/lib/aws/dynamodb";
import { requirePageUser } from "@/lib/auth/require-page-user";

type EvidenceRecord = {
  id: string;
  severity: string;
  reproductionInput: string;
  expectedBehavior: string;
  actualBehavior?: string;
  whyItFailed?: string;
  toolCalls?: unknown[];
};

export default async function PrivateReportPage({ params }: { params: Promise<{ id: string; run: string }> }) {
  const { id, run: runId } = await params;
  const user = await requirePageUser("/agents/" + id + "/report/" + runId);
  const [agent, run, status, records] = await Promise.all([getAgentForOwner(id, user.sub), getRunForOwner(runId, user.sub), getVerificationStatus(runId), getRunRecords(runId)]);
  if (!agent || !run || !status) notFound();
  const evidence = records.filter((record) => record.entityType === "Evidence") as unknown as EvidenceRecord[];
  return <AppShell><div className="product-page"><PageHeader eyebrow={"PRIVATE EVIDENCE / " + status.publicId} title="Verification Report" description={"Builder-facing forensic evidence for " + agent.name + " version " + status.agentVersion + "."} actions={<><ActionButton variant="quiet">Export JSON</ActionButton><ActionButton href={"/verify/" + status.publicId}>Public report</ActionButton></>} /><ReportSheet><div className="report-sheet__hero"><VerificationStamp status={status.status} size={145} /><div><div className="status-line"><span>AGENTPROOF VERIFIED</span><StatusPill status={status.status} /></div><h2 className="report-sheet__title">{agent.name} <span className="mono">v{status.agentVersion}</span></h2><div className="report-sheet__score">{status.overallScore}<small>/100</small></div><span className="eyebrow">RELIABILITY SCORE</span></div></div><ReportMetaGrid items={[{ label: "Last verified", value: status.lastVerified }, { label: "Valid until", value: status.validUntil }, { label: "Test scenarios", value: String(status.totalTests) }, { label: "Checksum", value: status.hash.slice(0, 18) + "..." }]} /></ReportSheet><section style={{ marginTop: 34 }}><div className="section-heading"><div><span className="eyebrow">FULL PRIVATE EVIDENCE</span><h2>What the runner observed</h2></div><Link className="mono" href={"/agents/" + agent.id}>← Back to dossier</Link></div><EvidenceLedger title="ASSERTION / EXPECTED / ACTUAL / JUDGMENT">{evidence.length ? evidence.map((item, index) => <EvidenceRow key={String(item.id)} id={"E-" + String(index + 1).padStart(2, "0")} category={String(item.severity).toUpperCase()} title={String(item.reproductionInput)} state={item.severity === "critical" ? "CRITICAL" : item.severity === "info" ? "PASS" : "WARN"} detail={"Expected: " + item.expectedBehavior + " Actual: " + (item.actualBehavior || "No response recorded.")}><div className="evidence-detail"><span>JUDGMENT / {String(item.whyItFailed || "Assertion satisfied")}</span><code>{JSON.stringify(item.toolCalls ?? [], null, 2)}</code></div></EvidenceRow>) : <p className="body-md">Evidence is still being written by the worker.</p>}</EvidenceLedger></section></div></AppShell>;
}
