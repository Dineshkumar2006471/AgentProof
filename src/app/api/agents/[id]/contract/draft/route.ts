import { createAgentSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";

type ContractDraftContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: ContractDraftContext) {
  try {
    const { id } = await context.params;
    const input = createAgentSchema.parse(await request.json());

    return jsonOk({
      contractDraft: {
        agentId: id,
        version: input.version,
        capabilities: [input.description],
        restrictions: input.mustNeverDo ? [input.mustNeverDo] : [],
        requiredBehavior: input.successCriteria ? [input.successCriteria] : [],
        failurePolicy: {}
      },
      provider: "openai",
      status: "draft_stub_requires_openai_key"
    });
  } catch (error) {
    return handleApiError(error);
  }
}
