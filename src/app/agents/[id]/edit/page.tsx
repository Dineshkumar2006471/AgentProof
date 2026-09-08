import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/proof-ui";
import { getAgentForOwner, getLatestContract } from "@/lib/aws/dynamodb";
import { requirePageUser } from "@/lib/auth/require-page-user";
import { AgentEditForm } from "./edit-form";

export default async function AgentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePageUser(`/agents/${id}/edit`);
  const agent = await getAgentForOwner(id, user.sub);
  if (!agent) notFound();

  const contract = await getLatestContract(id);

  return (
    <AppShell title={`Edit ${agent.name}`} section="AGENT SETTINGS">
      <div className="workspace-page">
        <PageHeader
          eyebrow="AGENT SETTINGS"
          title={`Edit ${agent.name}`}
          description="Update your endpoint URL, credentials, and contract rules. You can rerun verifications against this agent at any time."
        />
        <AgentEditForm agent={agent} contract={contract} />
      </div>
    </AppShell>
  );
}
