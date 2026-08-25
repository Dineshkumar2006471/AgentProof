import { createAgentSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";
import { createContractVersion, getAgentForOwner } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";
import { draftContract } from "@/lib/openai/contract-engine";

type ContractDraftContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: ContractDraftContext) {
  try {
    const { id } = await context.params;
    const input = createAgentSchema.parse(await request.json());
    const user = await requireUser();
    const agent = await getAgentForOwner(id, user.sub);
    if (!agent) return jsonOk({ error: "Agent not found." }, { status: 404 });
    const draft = await draftContract({
      name: agent.name,
      version: input.version,
      description: input.description,
      mustNeverDo: input.mustNeverDo,
      successCriteria: input.successCriteria
    });
    const contract = await createContractVersion({ agentId: id, version: input.version, ...draft });

    return jsonOk({ contractDraft: contract, provider: "openai", status: "drafted" });
  } catch (error) {
    return handleApiError(error);
  }
}
