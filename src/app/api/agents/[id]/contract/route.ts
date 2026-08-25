import { updateContractSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";

type ContractRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: ContractRouteContext) {
  try {
    const { id } = await context.params;
    const contract = updateContractSchema.parse(await request.json());

    return jsonOk({
      contract: {
        id: `contract_${crypto.randomUUID()}`,
        agentId: id,
        ...contract,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
