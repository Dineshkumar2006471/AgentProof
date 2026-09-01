import Link from "next/link";
import { ArrowDownToLine, ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
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

function displayDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).toUpperCase();
}

function displayTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function isFinding(item: EvidenceRecord) {
  return item.severity !== "info";
}

function EvidenceEntry({ item, index }: { item: EvidenceRecord; index: number }) {
  const isVerified = !isFinding(item);
  return (
    <article className="evidence-row">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap justify-between gap-3">
          <span className="mono">E-{String(index + 1).padStart(2, "0")} / {isVerified ? "VERIFIED" : item.severity.toUpperCase()}</span>
          <StatusPill status={isVerified ? "VERIFIED" : item.severity === "critical" ? "BLOCKED" : "CONDITIONAL"} />
        </div>
        <h3 className="mt-3 font-mono text-sm font-bold">{item.reproductionInput}</h3>
        <p className="body-md mt-2"><strong>Expected:</strong> {item.expectedBehavior}</p>
        <p className="body-md mt-1"><strong>Actual:</strong> {item.actualBehavior || "No response recorded."}</p>
        {!isVerified && <div className="evidence-detail mt-4"><span>JUDGMENT / {item.whyItFailed?.trim() && item.whyItFailed.trim() !== "/" ? item.whyItFailed : "No detailed judgment was recorded."}</span></div>}
        {Array.isArray(item.toolCalls) && item.toolCalls.length > 0 && <details className="mt-4"><summary className="mono cursor-pointer text-xs text-[var(--color-seal-indigo)]">TOOL EVIDENCE</summary><code className="mt-3 block">{JSON.stringify(item.toolCalls, null, 2)}</code></details>}
      </div>
    </article>
  );
}

export default async function PrivateReportPage({ params }: { params: Promise<{ id: string; run: string }> }) {
  const { id, run: runId } = await params;
  const user = await requirePageUser(`/agents/${id}/report/${runId}`);
  const [agent, run, status, records] = await Promise.all([
    getAgentForOwner(id, user.sub),
    getRunForOwner(runId, user.sub),
    getVerificationStatus(runId),
    getRunRecords(runId)
  ]);
  if (!agent || !run || !status) notFound();
  const evidence = records.filter((record) => record.entityType === "Evidence") as unknown as EvidenceRecord[];
  const findings = evidence.filter(isFinding);
  const verifiedEvidence = evidence.filter((item) => !isFinding(item));

  return (
    <AppShell title="Verification report" section="PRIVATE EVIDENCE">
      <div className="workspace-page">
        <PageHeader
          eyebrow="PRIVATE EVIDENCE"
          title="Verification report"
          description={`Builder-facing evidence for ${agent.name} version ${status.agentVersion}.`}
          actions={
            <>
              <ActionButton variant="quiet" href={`/api/runs/${runId}/export`} icon={<ArrowDownToLine size={15} />}>
                Export JSON
              </ActionButton>
              <ActionButton href={`/verify/${status.publicId}`} icon={<ExternalLink size={15} />}>
                Public report
              </ActionButton>
            </>
          }
        />

        <section className="workspace-panel report-summary">
          <div className="report-summary__status">
            <span className="eyebrow">VERIFICATION STATUS</span>
            <span className="report-summary__stamp mt-3">
              <StatusPill status={status.status} />
            </span>
          </div>
          <div className="report-summary__identity">
            <span className="eyebrow">AGENTPROOF ATTESTATION</span>
            <h2 className="workspace-heading mt-3">{agent.name}</h2>
            <p className="mono mt-2">VERSION / {status.agentVersion}</p>
          </div>
          <div className="report-summary__score-block">
            <span className="eyebrow">RELIABILITY SCORE</span>
            <div className="report-summary__score mt-3">
              {status.overallScore}<small>/100</small>
            </div>
          </div>
        </section>

        <div className="report-kpi-grid report-kpi-grid--private">
          <KpiGrid metrics={[
            { label: "Last verified", value: displayDate(status.lastVerified), detail: `${displayTime(status.lastVerified)} / Most recent execution` },
            { label: "Valid until", value: displayDate(status.validUntil), detail: "Attestation window" },
            { label: "Test scenarios", value: String(status.totalTests), detail: `${status.passed} passed` },
            { label: "Report status", value: status.status, detail: "Integrity record issued" }
          ]} />
        </div>

        <div className="dossier-layout">
          <section className="workspace-panel workspace-panel--table">
            <div className="workspace-panel__title">
              <span className="eyebrow">PRIVATE FINDINGS</span>
              <h2 className="workspace-heading mt-2">What needs review</h2>
            </div>
            {findings.length ? (
              <div>
                {findings.map((item, index) => <EvidenceEntry key={item.id} item={item} index={index} />)}
              </div>
            ) : (
              <div className="workspace-empty">
                <strong>No findings require review.</strong>
                <span>All persisted assertions met their expected behavior.</span>
              </div>
            )}
            {verifiedEvidence.length > 0 && <details className="border-t border-[var(--color-outline-variant)] px-5 py-4"><summary className="mono cursor-pointer text-xs text-[var(--color-seal-indigo)]">VERIFIED EVIDENCE / {verifiedEvidence.length} ASSERTIONS</summary><div className="mt-4 border-t border-[var(--color-outline-variant)]">{verifiedEvidence.map((item, index) => <EvidenceEntry key={item.id} item={item} index={findings.length + index} />)}</div></details>}
          </section>

          <aside className="dossier-side">
            <section className="workspace-panel">
              <div className="workspace-panel__title">
                <span className="eyebrow">RUN METADATA</span>
                <h2 className="workspace-heading mt-2">Execution record</h2>
              </div>
              <dl className="settings-rows">
                <div><dt className="eyebrow">TEST SUITE</dt><dd className="mono">{run.testSuiteVersion}</dd></div>
                <div><dt className="eyebrow">STARTED</dt><dd className="mono">{new Date(run.startedAt).toLocaleString("en-IN")}</dd></div>
                <div><dt className="eyebrow">RESULTS</dt><dd className="mono">{run.passed} passed / {run.failed} failed</dd></div>
              </dl>
            </section>
            <Link href={`/agents/${agent.id}`} className="mono inline-flex items-center gap-2 text-[var(--color-seal-indigo)]">
              <ArrowLeft size={14} /> Back to dossier
            </Link>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
