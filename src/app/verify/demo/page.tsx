import { PublicReportView } from "@/components/public-report-view";
import type { Metadata } from "next";
import { demoReport } from "@/lib/demo-report";

export const metadata: Metadata = {
  title: "Sample AI Agent Verification Report",
  description: "Explore a sample AgentProof report with agent test outcomes, reliability score, and actionable verification findings.",
  alternates: { canonical: "/verify/demo" },
  robots: { index: true, follow: true }
};

export default function DemoReportPage() {
  return <PublicReportView report={demoReport} demo />;
}
