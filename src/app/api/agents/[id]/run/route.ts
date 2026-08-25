import { startRunSchema } from "@/lib/validation";
import { handleApiError, jsonOk } from "@/lib/api";

type RunRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RunRouteContext) {
  try {
    const { id } = await context.params;
    const input = startRunSchema.parse(await request.json().catch(() => ({})));

    return jsonOk(
      {
        run: {
          id: `run_${crypto.randomUUID()}`,
          agentId: id,
          contractId: input.contractId,
          status: "queued",
          startedAt: new Date().toISOString()
        },
        queue: "sqs_stub_requires_aws_env"
      },
      { status: 202 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
