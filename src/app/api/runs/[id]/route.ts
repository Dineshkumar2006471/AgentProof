import { handleApiError, jsonOk } from "@/lib/api";

type RunsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RunsRouteContext) {
  try {
    const { id } = await context.params;

    return jsonOk({
      run: {
        id,
        status: "running",
        completed: 114,
        total: 184,
        percent: 62
      },
      testResults: []
    });
  } catch (error) {
    return handleApiError(error);
  }
}
