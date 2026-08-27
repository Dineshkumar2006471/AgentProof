import { handleApiError, jsonOk } from "@/lib/api";
import { getPublicReport } from "@/lib/aws/dynamodb";

type PublicVerifyContext = { params: Promise<{ publicId: string }> };

export async function GET(_request: Request, context: PublicVerifyContext) {
  try {
    const { publicId } = await context.params;
    const report = await getPublicReport(publicId);
    if (!report) return jsonOk({ error: "Report not found." }, { status: 404 });
    return jsonOk({ publicReport: { publicId: report.publicId, agentName: report.agentName, agentVersion: report.agentVersion, status: report.status, score: report.score, overallScore: report.overallScore, totalTests: report.totalTests, passed: report.passed, failed: report.failed, critical: report.critical, lastVerified: report.lastVerified, validUntil: report.validUntil, whatWasTested: report.whatWasTested, evidenceSummary: report.evidenceSummary, hash: report.hash } });
  } catch (error) {
    return handleApiError(error);
  }
}
