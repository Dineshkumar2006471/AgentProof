import { updateContractSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";
import { createContractVersion, getAgentForOwner } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";

type ContractRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: ContractRouteContext) {
  try {
    const { id } = await context.params;
    const contract = updateContractSchema.parse(await request.json());
    const user = await requireUser();
    if (!await getAgentForOwner(id, user.sub)) return jsonOk({ error: "Agent not found." }, { status: 404 });
    const persisted = await createContractVersion({ agentId: id, ...contract });

    return jsonOk({ contract: persisted });
  } catch (error) {
    return handleApiError(error);
  }
}
