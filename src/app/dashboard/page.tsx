import { Plus } from "lucide-react";
import { AgentRegistry } from "@/components/agent-registry";
import { AppShell } from "@/components/app-shell";
import { ActionButton, KpiGrid, PageHeader } from "@/components/proof-ui";
import { getLatestAgentVerification, listAgentsByOwner } from "@/lib/aws/dynamodb";
import { requirePageUser } from "@/lib/auth/require-page-user";

export default async function Dashboard() {
  const user = await requirePageUser("/dashboard");
  const agents = await listAgentsByOwner(user.sub);
  const rows = await Promise.all(agents.map(async (agent) => ({ agent, latest: await getLatestAgentVerification(agent.id) })));
  const verified = rows.filter((row) => row.latest?.status?.status === "VERIFIED").length;
  const blocked = rows.filter((row) => row.latest?.status?.status === "BLOCKED").length;
  const scored = rows.map((row) => row.latest?.status?.overallScore).filter((score): score is number => typeof score === "number");
  const average = scored.length ? Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length) : undefined;
  const latestRuns = rows.filter((row) => row.latest?.run).length;

  return <AppShell title="VERIFICATION WORKSPACE" section="AGENT REGISTRY"><div className="workspace-page">
    <PageHeader eyebrow="OVERVIEW" title="VERIFICATION WORKSPACE" description="See every registered deployment, its latest proof, and the next action." actions={<ActionButton href="/agents/new" icon={<Plus size={15} />}>New agent</ActionButton>} />
    <KpiGrid metrics={[{ label: "Total agents", value: String(rows.length), detail: "Registered deployments" }, { label: "Verified", value: String(verified), detail: "Latest proof passed", tone: "pass" }, { label: "Blocked", value: String(blocked), detail: "Needs investigation", tone: blocked ? "fail" : "default" }, { label: "Average reliability", value: average === undefined ? "--" : `${average}/100`, detail: latestRuns ? `${latestRuns} latest runs represented` : "No runs recorded" }]} />

    <div className="dashboard-overview">
      <section className="workspace-panel overview-panel" aria-labelledby="coverage-title">
        <div className="overview-panel__header"><div><span className="eyebrow">VERIFICATION COVERAGE</span><h2 id="coverage-title" className="workspace-heading mt-2">LATEST RELIABILITY BY AGENT</h2></div><span className="mono">{latestRuns} RUNS REPRESENTED</span></div>
        {rows.length ? <div className="overview-bars" aria-label="Reliability bars">{rows.slice(0, 12).map(({ agent, latest }) => <span key={agent.id} title={`${agent.name}: ${latest?.status?.overallScore ?? "not run"}`} style={{ height: `${Math.max(12, latest?.status?.overallScore ?? 12)}%` }} />)}</div> : <div className="overview-empty">Register an agent to see verification coverage here.</div>}
      </section>
      <section className="workspace-panel overview-panel" aria-labelledby="readiness-title">
        <div className="overview-panel__header"><div><span className="eyebrow">READINESS</span><h2 id="readiness-title" className="workspace-heading mt-2">Deployment health</h2></div><span className="mono">LIVE</span></div>
        <div className="readiness-list"><div className="readiness-row"><span>Verified deployments</span><strong>{rows.length ? `${Math.round((verified / rows.length) * 100)}%` : "--"}</strong><small><i style={{ width: `${rows.length ? (verified / rows.length) * 100 : 0}%` }} /></small></div><div className="readiness-row"><span>Runs with a score</span><strong>{rows.length ? `${Math.round((scored.length / rows.length) * 100)}%` : "--"}</strong><small><i style={{ width: `${rows.length ? (scored.length / rows.length) * 100 : 0}%` }} /></small></div><div className="readiness-row"><span>Open blockers</span><strong className={blocked ? "text-[var(--color-fail-clay)]" : "text-[var(--color-pass-moss)]"}>{blocked}</strong><small><i style={{ width: `${rows.length ? (blocked / rows.length) * 100 : 0}%`, background: blocked ? "var(--color-fail-clay)" : "var(--color-pass-moss)" }} /></small></div></div>
      </section>
    </div>

    <AgentRegistry rows={rows.map(({ agent, latest }) => ({ id: agent.id, name: agent.name, version: agent.currentVersion, status: latest?.status?.status, reliability: latest?.status?.overallScore, lastRun: latest?.run ? new Date(latest.run.startedAt).toLocaleDateString("en-IN") : undefined }))} />
  </div></AppShell>;
}
