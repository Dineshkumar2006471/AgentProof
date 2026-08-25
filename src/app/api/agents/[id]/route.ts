import { handleApiError, jsonOk } from "@/lib/api";
import { sampleAgents } from "@/lib/sample-data";

type AgentRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: AgentRouteContext) {
  try {
    const { id } = await context.params;
    const agent = sampleAgents.find((item) => item.id === id) ?? null;

    return jsonOk({ agent });
  } catch (error) {
    return handleApiError(error);
  }
}
