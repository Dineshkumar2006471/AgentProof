import { notFound } from "next/navigation";
import { PublicReportView } from "@/components/public-report-view";
import { getPublicReport } from "@/lib/aws/dynamodb";

export default async function PublicReport({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const report = await getPublicReport(publicId);
  if (!report) notFound();

  return <PublicReportView report={report} />;
}
