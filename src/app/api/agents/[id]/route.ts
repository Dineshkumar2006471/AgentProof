import { handleApiError, jsonOk } from "@/lib/api";
import { deleteAgent, getAgentForOwner, getLatestContract, updateAgent, upsertContractVersion } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";
import { updateAgentSchema } from "@/lib/validation";

type AgentRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: AgentRouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const agent = await getAgentForOwner(id, user.sub);

    return agent ? jsonOk({ agent }) : jsonOk({ error: "Agent not found." }, { status: 404 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: AgentRouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const input = updateAgentSchema.parse(await request.json());

    const updated = await updateAgent({
      id,
      ownerId: user.sub,
      name: input.name,
      endpointUrl: input.endpointUrl,
      version: input.version,
      endpointAuthType: input.endpointAuthType,
      endpointAuthToken: input.endpointAuthToken,
      endpointAuthUsername: input.endpointAuthUsername,
      endpointAuthHeaderName: input.endpointAuthHeaderName
    });

    if (input.description || input.mustNeverDo || input.successCriteria) {
      const existingContract = await getLatestContract(id);
      if (existingContract) {
        await upsertContractVersion({
          agentId: id,
          version: input.version || updated.currentVersion,
          capabilities: existingContract.capabilities,
          restrictions: input.mustNeverDo
            ? input.mustNeverDo.split("\n").map((s) => s.trim()).filter(Boolean)
            : existingContract.restrictions,
          requiredBehavior: input.successCriteria
            ? input.successCriteria.split("\n").map((s) => s.trim()).filter(Boolean)
            : existingContract.requiredBehavior,
          failurePolicy: existingContract.failurePolicy
        });
      }
    }

    return jsonOk({ agent: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: AgentRouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const success = await deleteAgent(id, user.sub);
    if (!success) return jsonOk({ error: "Agent not found." }, { status: 404 });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
