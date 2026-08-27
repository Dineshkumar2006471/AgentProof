import { getRunForOwner, getRunRecords } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";
import { handleApiError } from "@/lib/api";

type ExportContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: ExportContext) {
  try {
    const { id } = await context.params;
    const user = await requireUser();
    const run = await getRunForOwner(id, user.sub);
    if (!run) return Response.json({ error: "Run not found." }, { status: 404 });
    const records = await getRunRecords(id);
    return new Response(JSON.stringify({ run, records }, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="agentproof-${id}.json"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
