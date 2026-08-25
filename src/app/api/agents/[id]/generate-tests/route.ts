import { handleApiError, jsonOk } from "@/lib/api";
import { generateTestsSchema } from "@/lib/validation";
import { getAgentForOwner, getContract, saveTests } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";
import { generateTests } from "@/lib/openai/test-generator";

type GenerateTestsContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: GenerateTestsContext) {
  try {
    const { id } = await context.params;
    const input = generateTestsSchema.parse(await request.json());
    const user = await requireUser();
    if (!await getAgentForOwner(id, user.sub)) return jsonOk({ error: "Agent not found." }, { status: 404 });
    const contract = await getContract(id, input.contractId);
    if (!contract) return jsonOk({ error: "Contract not found." }, { status: 404 });
    const tests = await generateTests(contract, id);
    await saveTests(id, tests);

    return jsonOk({
      agentId: id,
      generationStatus: "completed",
      languageCode: "en",
      provider: "openai",
      tests
    });
  } catch (error) {
    return handleApiError(error);
  }
}
