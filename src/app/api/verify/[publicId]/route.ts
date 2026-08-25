import { handleApiError, jsonOk } from "@/lib/api";
import { getPublicReport } from "@/lib/aws/dynamodb";

type PublicVerifyContext = {
  params: Promise<{ publicId: string }>;
};

export async function GET(_request: Request, context: PublicVerifyContext) {
  try {
    const { publicId } = await context.params;

    const report = await getPublicReport(publicId);
    return report ? jsonOk({ publicReport: report }) : jsonOk({ error: "Report not found." }, { status: 404 });
  } catch (error) {
    return handleApiError(error);
  }
}
