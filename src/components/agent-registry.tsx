"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import type { VerificationStatus } from "@/lib/domain";

export type RegistryRow = {
  id: string;
  name: string;
  version: string;
  status?: VerificationStatus;
  reliability?: number;
  lastRun?: string;
};

export function AgentRegistry({ rows }: { rows: RegistryRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesQuery = `${row.name} ${row.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "ALL" || (status === "NOT RUN" ? !row.status : row.status === status);
    return matchesQuery && matchesStatus;
  }), [query, rows, status]);

  return (
    <section id="agents" className="workspace-panel workspace-panel--table" aria-labelledby="agent-registry-title">
      <div className="workspace-panel__header workspace-panel__header--controls">
        <div><span className="eyebrow">REGISTRY</span><h2 id="agent-registry-title" className="workspace-heading mt-2">YOUR AGENTS</h2></div>
        <div className="registry-controls">
          <label className="registry-search"><Search size={15} /><span className="sr-only">Search agents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents" /></label>
          <label className="registry-filter"><SlidersHorizontal size={15} /><span className="sr-only">Filter agents by status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="VERIFIED">Verified</option><option value="CONDITIONAL">Conditional</option><option value="FAILED">Failed</option><option value="BLOCKED">Blocked</option><option value="NOT RUN">Not run</option></select></label>
        </div>
      </div>
      <div className="workspace-table-wrap">
        <table className="workspace-table">
          <thead><tr><th>Agent</th><th>Version</th><th>Status</th><th>Reliability</th><th>Last run</th><th><span className="sr-only">Action</span></th></tr></thead>
          <tbody>
            {filteredRows.map((row) => <tr key={row.id}><td><Link href={`/agents/${row.id}`} className="table-primary">{row.name}</Link><span className="table-secondary">{row.id}</span></td><td className="mono">v{row.version}</td><td>{row.status ? <StatusPill status={row.status} /> : <span className="table-muted">NOT RUN</span>}</td><td className="mono">{row.reliability === undefined ? "--" : `${row.reliability}/100`}</td><td className="mono table-muted">{row.lastRun ?? "--"}</td><td className="table-action"><Link href={`/agents/${row.id}`}>Open</Link></td></tr>)}
            {!filteredRows.length && <tr><td colSpan={6}><div className="workspace-empty"><strong>{rows.length ? "No agents match these filters." : "No agents registered yet."}</strong><span>{rows.length ? "Clear the search or status filter to see more agents." : "Create an agent to begin generating verification evidence."}</span>{!rows.length && <Link href="/agents/new" className="action-button action-button--primary">Create agent</Link>}</div></td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
