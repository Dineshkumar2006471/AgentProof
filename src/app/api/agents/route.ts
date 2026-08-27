import { createAgentSchema } from "@/lib/validation";
import { ApiError, handleApiError, jsonOk } from "@/lib/api";
import { createAgent, listAgentsByOwner } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ agents: await listAgentsByOwner(user.sub) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createAgentSchema.parse(await request.json());
    const user = await requireUser();
    if (env.AGENTPROOF_BETA_MODE === "true") {
      const existingAgents = await listAgentsByOwner(user.sub);
      if (existingAgents.length >= env.AGENTPROOF_BETA_MAX_AGENTS_PER_USER) {
        throw new ApiError(
          429,
          `Open beta limit reached. Each account can register up to ${env.AGENTPROOF_BETA_MAX_AGENTS_PER_USER} agents.`
        );
      }
    }

    const agent = await createAgent({
      ownerId: user.sub,
      name: input.name,
      endpointUrl: input.endpointUrl,
      version: input.version,
      endpointAuthType: input.endpointAuthType,
      endpointAuthToken: input.endpointAuthToken
    });
    return jsonOk({ agent }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
