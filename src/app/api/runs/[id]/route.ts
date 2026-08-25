import { handleApiError, jsonOk } from "@/lib/api";
import { getRunForOwner, getRunRecords } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";

type RunsRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RunsRouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const run = await getRunForOwner(id, user.sub);
    if (!run) return jsonOk({ error: "Run not found." }, { status: 404 });
    const records = await getRunRecords(id);
    const testResults = records.filter((record) => record.entityType === "TestRun");
    const status = records.find((record) => record.entityType === "VerificationStatus") ?? null;
    const completed = testResults.length;

    return jsonOk({
      run: {
        ...run,
        completed,
        percent: run.totalTests ? Math.round((completed / run.totalTests) * 100) : 0
      },
      testResults,
      status
    });
  } catch (error) {
    return handleApiError(error);
  }
}
