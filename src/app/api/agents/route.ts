import { createAgentSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";
import { sampleAgents } from "@/lib/sample-data";

export async function GET() {
  return jsonOk({ agents: sampleAgents });
}

export async function POST(request: Request) {
  try {
    const input = createAgentSchema.parse(await request.json());

    return jsonOk(
      {
        agent: {
          id: `agent_${crypto.randomUUID()}`,
          ownerId: "current_user",
          name: input.name,
          endpointUrl: input.endpointUrl,
          currentVersion: input.version,
          createdAt: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
