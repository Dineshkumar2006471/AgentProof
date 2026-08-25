import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActionButton, ContractWindow, EvidenceLedger, EvidenceRow, MetricStrip, PageHeader, ProofPanel } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import { VerificationStamp } from "@/components/verification-stamp";
import { getAgentForOwner, getLatestContract, getVerificationStatus, listRunsByAgent } from "@/lib/aws/dynamodb";
import { requirePageUser } from "@/lib/auth/require-page-user";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePageUser("/agents/" + id);
  const agent = await getAgentForOwner(id, user.sub);
  if (!agent) notFound();
  const [contract, runs] = await Promise.all([getLatestContract(id), listRunsByAgent(id)]);
  const statuses = await Promise.all(runs.map((run) => getVerificationStatus(run.id)));
  const latest = statuses[0];
  const reportHref = latest?.publicId ? "/verify/" + latest.publicId : undefined;
  const score = latest?.overallScore ?? 0;

  return <AppShell><div className="product-page">
    <PageHeader eyebrow="AGENT DOSSIER" title={agent.name} description="The current operational contract, latest verification status, and issued evidence for this deployment." meta={<><span>REGISTRY / {agent.id}</span><span>ENDPOINT / {agent.endpointUrl}</span>{latest && <StatusPill status={latest.status} />}</>} actions={<><ActionButton variant="quiet" href={reportHref}>Public report</ActionButton><ActionButton href={"/agents/" + agent.id + "/run"}>Run verification</ActionButton></>} />
    <MetricStrip metrics={[{ label: "Reliability score", value: latest ? String(score) + "/100" : "--", tone: latest?.status === "BLOCKED" ? "fail" : "pass" }, { label: "Tests executed", value: latest ? String(latest.totalTests) : "--" }, { label: "Critical failures", value: latest ? String(latest.critical) : "--", tone: latest?.critical ? "fail" : "pass" }, { label: "Valid until", value: latest?.validUntil ?? "--" }]} />
    <div className="split-layout"><div className="artifact-stack"><ContractWindow><pre>{contract ? JSON.stringify({ agent: agent.name, version: contract.version, capabilities: contract.capabilities, restrictions: contract.restrictions, requiredBehavior: contract.requiredBehavior, failurePolicy: contract.failurePolicy }, null, 2) : "No operational contract has been drafted."}</pre></ContractWindow><ProofPanel><div className="section-kicker">RECENT VERIFICATION RUNS</div><EvidenceLedger title="RUN / SCORE / STATUS">{runs.length ? runs.map((run, index) => { const status = statuses[index]; return <EvidenceRow key={run.id} id={run.id.slice(-8).toUpperCase()} category="RUN" title={new Date(run.startedAt).toLocaleDateString("en-IN") + " / " + run.testSuiteVersion} state={status?.status === "BLOCKED" || status?.status === "FAILED" ? "WARN" : status ? "PASS" : "RUNNING"} detail={status ? String(status.passed) + " of " + status.totalTests + " assertions passed · " + status.overallScore + "/100" : run.status + " / " + run.totalTests + " scenarios queued"} />; }) : <p className="body-md">No verification runs recorded yet.</p>}</EvidenceLedger></ProofPanel></div><div className="artifact-stack"><ProofPanel dark className="stamp-panel"><span className="eyebrow" style={{ color: "#d8b17d" }}>AGENTPROOF VERIFIED</span>{latest ? <VerificationStamp status={latest.status} size={150} /> : <span className="mono">NOT YET VERIFIED</span>}<strong className="stamp-panel__name">{agent.name}</strong><span className="stamp-panel__meta">Version {agent.currentVersion} / Operational contract</span></ProofPanel>{reportHref && <ProofPanel><div className="section-kicker">PUBLIC REPORT</div><p className="body-md" style={{ color: "var(--muted)", margin: "12px 0" }}>Publish a plain-language status page for buyers and users.</p><code className="embed-code">&lt;AgentProofBadge reportId=&quot;{latest?.publicId}&quot; /&gt;</code><ActionButton variant="quiet" href={reportHref} icon={null}>Inspect public report</ActionButton></ProofPanel>}</div></div>
  </div></AppShell>;
}
