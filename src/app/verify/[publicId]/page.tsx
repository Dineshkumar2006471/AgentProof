import Image from "next/image";
import { notFound } from "next/navigation";
import { ActionButton, EvidenceLedger, EvidenceRow, ReportMetaGrid, ReportSheet } from "@/components/proof-ui";
import { StatusPill } from "@/components/status-pill";
import { VerificationStamp } from "@/components/verification-stamp";
import { getPublicReport } from "@/lib/aws/dynamodb";

export default async function PublicReportPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const report = await getPublicReport(publicId);
  if (!report) notFound();
  return <main className="page-shell"><div className="public-report product-page"><Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={34} priority style={{ mixBlendMode: "multiply" }} /><ReportSheet><div className="report-sheet__hero"><VerificationStamp status={report.status} size={150} /><div><div className="status-line"><span>OFFICIAL PUBLIC REPORT</span><StatusPill status={report.status} /></div><h1 className="report-sheet__title">{report.agentName} <span className="mono">v{report.agentVersion}</span></h1><div className="report-sheet__score">{report.overallScore}<small>/100</small></div><span className="eyebrow">AGENTPROOF VERIFIED</span></div></div><ReportMetaGrid items={[{ label: "Last verified", value: report.lastVerified }, { label: "Valid until", value: report.validUntil }, { label: "Scenarios tested", value: String(report.totalTests) }, { label: "Passed", value: report.passed + " / " + report.totalTests }]} /></ReportSheet><section className="public-report__section"><span className="eyebrow">WHAT WAS TESTED?</span><h2>Behavior under real pressure</h2><div className="tested-list">{report.whatWasTested.map((item, index) => <span key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</span>)}</div></section>{report.evidenceSummary.length > 0 && <EvidenceLedger title="PUBLIC EVIDENCE SUMMARY">{report.evidenceSummary.map((item, index) => <EvidenceRow key={item.severity + "-" + index} id={"E-" + String(index + 1).padStart(2, "0")} category={item.severity.toUpperCase()} title={item.severity === "critical" ? "A critical issue was recorded." : "A non-critical issue was recorded."} state={item.severity === "critical" ? "CRITICAL" : "WARN"} detail={item.whyItFailed} />)}</EvidenceLedger>}<div className="public-report__actions"><ActionButton variant="quiet" href="/">AgentProof home</ActionButton></div></div></main>;
}
