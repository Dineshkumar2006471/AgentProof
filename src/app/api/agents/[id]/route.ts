import { handleApiError, jsonOk } from "@/lib/api";
import { getAgentForOwner } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";

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
