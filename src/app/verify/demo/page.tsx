import { PublicReportView } from "@/components/public-report-view";
import { demoReport } from "@/lib/demo-report";

export default function DemoReportPage() {
  return <PublicReportView report={demoReport} demo />;
}
