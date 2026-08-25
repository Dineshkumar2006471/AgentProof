import { handleApiError, jsonOk } from "@/lib/api";
import { samplePublicReport } from "@/lib/sample-data";

type PublicVerifyContext = {
  params: Promise<{ publicId: string }>;
};

export async function GET(_request: Request, context: PublicVerifyContext) {
  try {
    const { publicId } = await context.params;

    return jsonOk({
      publicReport: {
        ...samplePublicReport,
        publicId
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
