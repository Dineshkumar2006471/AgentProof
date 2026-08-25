import { createAgentSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";
import { createAgent, listAgentsByOwner } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";

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

    const agent = await createAgent({ ownerId: user.sub, ...input });
    return jsonOk({ agent }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
