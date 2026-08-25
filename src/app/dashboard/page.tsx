import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ActionButton, PageHeader } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import { sampleAgents } from "@/lib/sample-data";

export default function DashboardPage() {
  return <AppShell><div className="product-page">
    <PageHeader eyebrow="AGENT REGISTRY" title="Verification workspace" description="A live register of the agents, contracts, and verification evidence your team has issued." actions={<ActionButton href="/agents/new">New agent</ActionButton>} />
    <div className="agent-registry" aria-label="Agent registry">
      <div className="agent-registry__head"><span>Agent</span><span>Version</span><span>Status</span><span>Score</span><span>Last run</span><span /></div>
      {sampleAgents.map((agent, index) => <Link className="agent-registry__row" href={`/agents/${agent.id}`} key={agent.id} style={{ animationDelay: `${index * 70}ms` }}>
        <div><strong>{agent.name}</strong><small>{agent.endpointUrl}</small></div><span>v{agent.currentVersion}</span><StatusPill status={agent.latestStatus} /><span className="score">{agent.overallScore ? `${agent.overallScore}/100` : "--"}</span><span>22 AUG 2026</span><span className="mono">VIEW →</span>
      </Link>)}
    </div>
    <div className="dashboard-summary"><div className="dashboard-summary__big"><span>This week / execution volume</span><strong>312</strong></div><div className="dashboard-summary__list"><div><span>Total agents</span><strong>03</strong></div><div><span>Verified</span><strong className="tone-pass">01</strong></div><div><span>Blocked</span><strong className="tone-fail">01</strong></div><div><span>Reports issued</span><strong>08</strong></div></div></div>
  </div></AppShell>;
}
