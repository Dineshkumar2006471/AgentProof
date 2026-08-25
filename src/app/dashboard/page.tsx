import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ActionButton, PageHeader } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import { listAgentsByOwner, getLatestAgentVerification } from "@/lib/aws/dynamodb";
import { requirePageUser } from "@/lib/auth/require-page-user";

export default async function DashboardPage() {
  const user = await requirePageUser("/dashboard");
  const agents = await listAgentsByOwner(user.sub);
  const rows = await Promise.all(agents.map(async (agent) => ({ agent, latest: await getLatestAgentVerification(agent.id) })));
  const verified = rows.filter(({ latest }) => latest?.status?.status === "VERIFIED").length;
  const blocked = rows.filter(({ latest }) => latest?.status?.status === "BLOCKED").length;
  const runs = rows.reduce((total, { latest }) => total + (latest ? 1 : 0), 0);

  return <AppShell><div className="product-page">
    <PageHeader eyebrow="AGENT REGISTRY" title="Verification workspace" description="A live register of the agents, contracts, and verification evidence your team has issued." actions={<ActionButton href="/agents/new">New agent</ActionButton>} />
    <div className="agent-registry" aria-label="Agent registry">
      <div className="agent-registry__head"><span>Agent</span><span>Version</span><span>Status</span><span>Score</span><span>Last run</span><span /></div>
      {rows.length ? rows.map(({ agent, latest }, index) => <Link className="agent-registry__row" href={`/agents/${agent.id}`} key={agent.id} style={{ animationDelay: `${index * 70}ms` }}>
        <div><strong>{agent.name}</strong><small>{agent.endpointUrl}</small></div><span>v{agent.currentVersion}</span>{latest?.status ? <StatusPill status={latest.status.status} /> : <span className="mono">NOT RUN</span>}<span className="score">{latest?.status ? `${latest.status.overallScore}/100` : "--"}</span><span>{latest?.run.startedAt ? new Date(latest.run.startedAt).toLocaleDateString("en-IN") : "--"}</span><span className="mono">VIEW →</span>
      </Link>) : <div className="empty-state"><strong>No agents registered.</strong><span>Create the first agent contract to begin verification.</span></div>}
    </div>
    <div className="dashboard-summary"><div className="dashboard-summary__big"><span>Recorded verification runs</span><strong>{String(runs).padStart(2, "0")}</strong></div><div className="dashboard-summary__list"><div><span>Total agents</span><strong>{String(rows.length).padStart(2, "0")}</strong></div><div><span>Verified</span><strong className="tone-pass">{String(verified).padStart(2, "0")}</strong></div><div><span>Blocked</span><strong className="tone-fail">{String(blocked).padStart(2, "0")}</strong></div><div><span>Reports issued</span><strong>{String(rows.filter(({ latest }) => Boolean(latest?.status)).length).padStart(2, "0")}</strong></div></div></div>
  </div></AppShell>;
}
