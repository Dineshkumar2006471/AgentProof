import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import { VerificationStamp } from "@/components/verification-stamp";
import { getAgentForOwner, getLatestContract, getVerificationStatus, listRunsByAgent } from "@/lib/aws/dynamodb";
import { requirePageUser } from "@/lib/auth/require-page-user";
import { endpointAuthLabel } from "@/lib/endpoint-auth";

function displayDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

function displayTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePageUser(`/agents/${id}`);
  const agent = await getAgentForOwner(id, user.sub);
  if (!agent) notFound();
  const [contract, runs] = await Promise.all([getLatestContract(id), listRunsByAgent(id)]);
  const statuses = await Promise.all(runs.map((run) => getVerificationStatus(run.id)));
  const latest = statuses[0];
  const reportHref = latest?.publicId ? `/verify/${latest.publicId}` : undefined;
  const score = latest?.overallScore;

  return (
    <AppShell title={agent.name} section="AGENT DOSSIER">
      <div className="workspace-page">
        <PageHeader
          eyebrow="AGENT DOSSIER"
          title={agent.name}
          description="Operational health, contract coverage, and the latest verification evidence for this deployment."
          meta={<div className="dossier-header-meta flex flex-wrap gap-x-5 gap-y-2 mono"><span>VERSION / {agent.currentVersion}</span><span className="dossier-header-endpoint">ENDPOINT / {agent.endpointUrl}</span>{latest && <StatusPill status={latest.status} />}</div>}
          actions={<><ActionButton href={`/agents/${agent.id}/run`}>Run verification</ActionButton>{reportHref && <ActionButton variant="quiet" href={reportHref} icon={null}>Public report</ActionButton>}</>}
        />

        <div className="dossier-kpi-grid">
          <KpiGrid metrics={[
            { label: "Reliability score", value: score === undefined ? "--" : `${score}/100`, detail: latest ? "Latest verification" : "No completed run", tone: latest?.status === "BLOCKED" || latest?.status === "FAILED" ? "fail" : "pass" },
            { label: "Tests executed", value: latest ? String(latest.totalTests) : "--", detail: latest ? `${latest.passed} passed` : "Awaiting first run" },
            { label: "Critical failures", value: latest ? String(latest.critical) : "--", detail: latest?.critical ? "Requires attention" : "No critical findings", tone: latest?.critical ? "fail" : "pass" },
            { label: "Valid until", value: latest ? displayDate(latest.validUntil) : "--", detail: latest ? `${displayTime(latest.validUntil)} / Report validity` : "Not verified" }
          ]} />
        </div>

        <nav className="section-tabs" aria-label="Agent dossier sections"><a href="#overview">Overview</a><a href="#contract">Contract</a><a href="#runs">Runs</a><a href="#evidence">Evidence</a></nav>
        <div className="dossier-layout">
          <div className="dossier-main">
            <section id="overview" className="workspace-panel"><div className="workspace-panel__title"><span className="eyebrow">OVERVIEW</span><h2 className="workspace-heading mt-2">Deployment details</h2></div><div className="metadata-grid"><div><span className="eyebrow">AGENT ID</span><strong>{agent.id}</strong></div><div><span className="eyebrow">CURRENT VERSION</span><strong>{agent.currentVersion}</strong></div><div><span className="eyebrow">ENDPOINT AUTH</span><strong>{endpointAuthLabel(agent.endpointAuthType)}</strong></div><div><span className="eyebrow">REGISTERED</span><strong>{new Date(agent.createdAt).toLocaleDateString("en-IN")}</strong></div></div></section>
            <section id="contract" className="workspace-panel"><div className="workspace-panel__title"><span className="eyebrow">OPERATIONAL CONTRACT</span><h2 className="workspace-heading mt-2">What this agent promises</h2></div><div className="workspace-panel__body"><pre>{contract ? JSON.stringify({ agent: agent.name, version: contract.version, capabilities: contract.capabilities, restrictions: contract.restrictions, requiredBehavior: contract.requiredBehavior, failurePolicy: contract.failurePolicy }, null, 2) : "No operational contract has been drafted."}</pre></div></section>
            <section id="runs" className="workspace-panel workspace-panel--table"><div className="workspace-panel__title"><span className="eyebrow">VERIFICATION HISTORY</span><h2 className="workspace-heading mt-2">Recent runs</h2></div><div className="workspace-table-wrap"><table className="workspace-table"><thead><tr><th>Run</th><th>Status</th><th>Score</th><th>Tests</th><th>Started</th></tr></thead><tbody>{runs.map((run, index) => { const status = statuses[index]; return <tr key={run.id}><td><span className="table-primary">{run.id.slice(-12).toUpperCase()}</span><span className="table-secondary">{run.testSuiteVersion}</span></td><td>{status ? <StatusPill status={status.status} /> : <span className="table-muted">{run.status}</span>}</td><td className="mono">{status ? `${status.overallScore}/100` : "--"}</td><td className="mono">{status ? `${status.passed}/${status.totalTests}` : `${run.totalTests} queued`}</td><td className="mono table-muted">{new Date(run.startedAt).toLocaleDateString("en-IN")}</td></tr>; })}{!runs.length && <tr><td colSpan={5}><div className="workspace-empty"><strong>No verification runs yet.</strong><span>Run the contract to start collecting evidence.</span></div></td></tr>}</tbody></table></div></section>
          </div>
          <aside className="dossier-side">
            <section className="workspace-panel workspace-panel--dark p-6 text-white"><span className="eyebrow text-[var(--color-paper-cream)]">CURRENT ATTESTATION</span><div className="mt-5 flex justify-center">{latest ? <VerificationStamp status={latest.status} size={132} /> : <span className="mono py-12 text-white/70">NOT YET VERIFIED</span>}</div><strong className="mt-5 block text-center font-mono text-sm">{agent.name}</strong><span className="mt-2 block text-center mono text-white/65">v{agent.currentVersion} / operational contract</span></section>
            <section id="evidence" className="workspace-panel"><div className="workspace-panel__title"><span className="eyebrow">EVIDENCE ACCESS</span><h2 className="workspace-heading mt-2">Published proof</h2></div><div className="workspace-panel__body">{reportHref && latest ? <><p className="body-md">Share a plain-language verification report with buyers and users.</p><code className="embed-code">&lt;AgentProofBadge reportId=&quot;{latest.publicId}&quot; /&gt;</code><ActionButton variant="quiet" href={reportHref} icon={null}>Inspect report</ActionButton></> : <p className="body-md">A public report will appear after the first completed verification run.</p>}</div></section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
