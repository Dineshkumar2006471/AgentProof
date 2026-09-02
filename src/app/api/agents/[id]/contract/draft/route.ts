import { createAgentSchema } from "@/lib/validation";
import { ConflictError, handleApiError, jsonOk, UpstreamServiceError } from "@/lib/api";
import { createContractVersion, getAgentForOwner } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";
import { ContractProviderError, draftContract } from "@/lib/openai/contract-engine";
import { enforceRateLimit, rateLimits } from "@/lib/rate-limit";

type ContractDraftContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: ContractDraftContext) {
  try {
    const { id } = await context.params;
    const input = createAgentSchema.parse(await request.json());
    const user = await requireUser();
    await enforceRateLimit(request, rateLimits.aiGeneration, user.sub);
    const agent = await getAgentForOwner(id, user.sub);
    if (!agent) return jsonOk({ error: "Agent not found." }, { status: 404 });
    let draft;
    try {
      draft = await draftContract({
        name: agent.name,
        version: input.version,
        description: input.description,
        mustNeverDo: input.mustNeverDo,
        successCriteria: input.successCriteria
      });
    } catch (error) {
      if (error instanceof ContractProviderError) throw new UpstreamServiceError(error.message, "openai");
      throw error;
    }
    let contract;
    try {
      contract = await createContractVersion({ agentId: id, version: input.version, ...draft });
    } catch (error) {
      if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
        throw new ConflictError("This contract version already exists. Use a new version identifier.");
      }
      throw error;
    }

    return jsonOk({ contractDraft: contract, provider: "openai", status: "drafted" });
  } catch (error) {
    return handleApiError(error);
  }
}
