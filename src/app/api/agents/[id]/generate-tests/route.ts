import { handleApiError, jsonOk } from "@/lib/api";

type GenerateTestsContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: GenerateTestsContext) {
  try {
    const { id } = await context.params;

    return jsonOk({
      agentId: id,
      generationStatus: "queued",
      languageCode: "en",
      provider: "openai"
    });
  } catch (error) {
    return handleApiError(error);
  }
}
