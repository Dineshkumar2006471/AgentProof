import Image from "next/image";
import Link from "next/link";
import { Check, CircleAlert } from "lucide-react";
import type { PublicReport } from "@/lib/domain";
import { KpiGrid } from "@/components/proof-ui";
import { VerificationStamp } from "@/components/verification-stamp";

function displayDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

export function PublicReportView({ report, demo = false }: { report: PublicReport; demo?: boolean }) {
  return (
    <main className="public-report-shell font-mono text-[var(--color-ink-graphite)]">
      <div className="public-report-shell__inner">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-[var(--color-outline-variant)] pb-6">
          <Link href="/" aria-label="AgentProof home">
            <Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={34} priority style={{ mixBlendMode: "multiply" }} />
          </Link>
          <div className="text-right">
            <span className="eyebrow">{demo ? "SAMPLE VERIFICATION" : "PUBLIC VERIFICATION"}</span>
            <span className="mono mt-1 block break-all">REPORT / {report.publicId}</span>
          </div>
        </header>

        {demo && <div className="mb-6 border-l-2 border-[var(--color-evidence-amber)] bg-[var(--color-evidence-amber)]/10 px-4 py-3 font-mono text-xs text-[var(--color-on-surface-variant)]">SAMPLE REPORT / DEMO DATA ONLY</div>}

        <section className="workspace-panel">
          <div className="report-summary">
            <div className="report-summary__status">
              <span className="eyebrow">VERIFICATION STATUS</span>
              <span className="mt-3 inline-flex"><VerificationStamp status={report.status} size={96} /></span>
            </div>
            <div className="report-summary__identity">
              <span className="eyebrow">AGENTPROOF ATTESTATION</span>
              <h1 className="workspace-heading mt-3">{report.agentName}</h1>
              <p className="mono mt-2">VERSION / {report.agentVersion}</p>
            </div>
            <div className="report-summary__score-block">
              <span className="eyebrow">RELIABILITY SCORE</span>
              <div className="report-summary__score mt-3">{report.score.overallScore}<small>/100</small></div>
            </div>
          </div>

          <div className="report-kpi-grid">
            <KpiGrid metrics={[
              { label: "Tests", value: String(report.totalTests), detail: "Scenarios executed" },
              { label: "Passed", value: String(report.passed), detail: "Assertions satisfied", tone: "pass" },
              { label: "Failed", value: String(report.failed), detail: "Findings recorded", tone: report.failed ? "warn" : "default" },
              { label: "Valid until", value: displayDate(report.validUntil), detail: `Verified ${displayDate(report.lastVerified)}` }
            ]} />
          </div>

          <div className="grid gap-8 border-t border-[var(--color-outline-variant)] p-6 md:grid-cols-2 md:p-8">
            <div>
              <h2 className="eyebrow">WHAT WAS TESTED</h2>
              <ul className="mt-5 grid gap-3">
                {report.whatWasTested.map((item) => <li key={item} className="flex gap-3 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-[var(--color-pass-moss)]" />{item}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="eyebrow">REPORT INTEGRITY</h2>
              <dl className="mt-5 grid gap-4 text-sm">
                <div><dt className="table-muted">Last verified</dt><dd className="mt-1 font-bold">{displayDate(report.lastVerified)}</dd></div>
                <div><dt className="table-muted">Checksum</dt><dd className="mt-1 break-all font-bold">{report.hash}</dd></div>
              </dl>
            </div>
          </div>

          {report.evidenceSummary.length > 0 && <div className="border-t border-[var(--color-outline-variant)] p-6 md:p-8">
            <h2 className="eyebrow">REPORTED FINDINGS</h2>
            <div className="mt-5 divide-y divide-[var(--color-outline-variant)] border-y border-[var(--color-outline-variant)]">
              {report.evidenceSummary.map((finding, index) => <div key={`${finding.severity}-${index}`} className="flex gap-3 py-4 text-sm"><CircleAlert size={15} className="mt-0.5 shrink-0 text-[var(--color-evidence-amber)]" /><span>{finding.whyItFailed || "Assertion satisfied."}</span></div>)}
            </div>
          </div>}
        </section>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-outline-variant)] pt-5">
          <span className="mono">Issued by AgentProof verification infrastructure.</span>
          <Link href="/" className="mono text-[var(--color-seal-indigo)]">agentproof.dev</Link>
        </footer>
      </div>
    </main>
  );
}
