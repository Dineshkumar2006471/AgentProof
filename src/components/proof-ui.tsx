import type { ReactNode } from "react";
import { ArrowUpRight, Check, CircleAlert, CircleDashed, LoaderCircle } from "lucide-react";
import type { VerificationStatus } from "@/lib/domain";
import { StatusPill } from "@/components/status-pill";

export function ActionButton({
  children,
  href,
  variant = "primary",
  icon = <ArrowUpRight size={15} />,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "dark" | "quiet" | "danger";
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const baseClass = "action-button inline-flex items-center justify-center gap-2 font-body-md text-sm transition-colors border";
  let variantClass = "";
  if (variant === "primary") variantClass = "bg-[var(--color-seal-indigo)] text-white border-[var(--color-seal-indigo)] hover:bg-[var(--color-ink-graphite)] hover:border-[var(--color-ink-graphite)]";
  else if (variant === "dark") variantClass = "bg-[var(--color-ink-graphite)] text-white border-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-variant)]";
  else variantClass = "bg-transparent text-[var(--color-ink-graphite)] border-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-variant)]";

  const className = `${baseClass} ${variantClass}`;
  return href ? <a className={className} href={href}>{children}{icon}</a> : <button type="button" className={className} onClick={onClick}>{children}{icon}</button>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="workspace-page-header">
      <div className="workspace-page-header__copy">
        <span className="font-data-label text-data-label text-[var(--color-seal-indigo)] uppercase">{eyebrow}</span>
        <h1 className="font-headline-md text-headline-md mt-4 mb-4 text-[var(--color-ink-graphite)]">{title}</h1>
        {description && <p className="font-body-lg text-body-lg text-[var(--color-on-surface-variant)] mt-2 max-w-2xl border-l-2 border-[var(--color-seal-indigo)] pl-4">{description}</p>}
        {meta && <div className="mt-4">{meta}</div>}
      </div>
      {actions && <div className="workspace-page-header__actions">{actions}</div>}
    </header>
  );
}

export function ProofPanel({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  const bgClass = dark ? "bg-[var(--color-ink-graphite)] text-white" : "bg-[var(--color-paper-cream)] text-[var(--color-ink-graphite)]";
  return <section className={`workspace-panel ${dark ? "workspace-panel--dark" : ""} ${className} ${bgClass}`}>{children}</section>;
}

export function MetricStrip({ metrics }: { metrics: Array<{ label: string; value: string; tone?: "pass" | "warn" | "fail" | "default" }> }) {
  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <div className={`metric-card ${metric.tone ? `metric-card--${metric.tone}` : ""}`} key={metric.label}>
          <span className="font-data-label text-data-label text-[var(--color-on-surface-variant)] uppercase mb-2">{metric.label}</span>
          <strong className={`font-data-value text-3xl font-medium ${metric.tone === "pass" ? "text-[var(--color-pass-moss)]" : metric.tone === "fail" ? "text-[var(--color-fail-clay)]" : metric.tone === "warn" ? "text-[var(--color-evidence-amber)]" : "text-[var(--color-ink-graphite)]"}`}>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function KpiGrid({ metrics }: { metrics: Array<{ label: string; value: string; detail?: string; tone?: "pass" | "warn" | "fail" | "default" }> }) {
  return <div className="metric-grid">{metrics.map((metric) => <div className={`metric-card ${metric.tone ? `metric-card--${metric.tone}` : ""}`} key={metric.label}><span className="metric-card__label">{metric.label}</span><strong className="metric-card__value">{metric.value}</strong>{metric.detail && <span className="metric-card__detail">{metric.detail}</span>}</div>)}</div>;
}

export function ContractWindow({ title = "OPERATIONAL CONTRACT", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="workspace-panel contract-window">
      <div className="flex justify-between items-center p-4 border-b border-[var(--color-ink-graphite)] bg-[var(--color-surface-container-low)]">
        <span className="font-data-label text-data-label text-[var(--color-ink-graphite)]">{title}</span>
        <span className="font-data-label text-xs text-[var(--color-on-surface-variant)]">LOCKED / v1.4</span>
      </div>
      <div className="p-6 font-code-snippet text-code-snippet overflow-auto bg-[var(--color-paper-cream)]">{children}</div>
    </div>
  );
}

export function TerminalWindow({ children, title = "agentproof-runner:stdout" }: { title?: string; children: ReactNode }) {
  return (
    <div className="workspace-panel workspace-panel--dark terminal-window">
      <div className="flex items-center p-4 border-b border-[var(--color-surface-tint)] bg-[var(--color-inverse-surface)]">
        <div className="flex gap-2 mr-4 opacity-50">
          <i className="w-3 h-3 rounded-full bg-[var(--color-fail-clay)]" />
          <i className="w-3 h-3 rounded-full bg-[var(--color-evidence-amber)]" />
          <i className="w-3 h-3 rounded-full bg-[var(--color-pass-moss)]" />
        </div>
        <span className="font-data-label text-xs text-[var(--color-inverse-primary)]">{title}</span>
      </div>
      <div className="p-6 font-code-snippet text-code-snippet leading-relaxed opacity-90 overflow-auto">{children}</div>
    </div>
  );
}

export function StepRail({ current, steps, orientation = "vertical" }: { current: number; steps: string[]; orientation?: "vertical" | "horizontal" }) {
  if (orientation === "horizontal") {
    return <aside className="step-rail step-rail--horizontal" aria-label="Agent evaluation steps">{steps.map((step, index) => {
      const complete = current > index + 1;
      const active = current === index + 1;
      return <div className={`step-rail__item ${complete ? "is-complete" : ""} ${active ? "is-active" : ""}`} key={step}>
        {index > 0 && <span className="step-rail__connector step-rail__connector--before" aria-hidden="true" />}
        {index < steps.length - 1 && <span className="step-rail__connector step-rail__connector--after" aria-hidden="true" />}
        <span className="step-rail__node"><span>{String(index + 1).padStart(3, "0")}</span></span>
        <strong className="step-rail__label">{step}</strong>
      </div>;
    })}</aside>;
  }
  return <aside className="flex flex-col border-l border-[var(--color-ink-graphite)] ml-2" aria-label="Agent evaluation steps">{steps.map((step, index) => <div className={`flex items-center gap-4 py-4 -ml-[1px] ${current === index + 1 ? "text-[var(--color-seal-indigo)] border-l-2 border-[var(--color-seal-indigo)]" : current > index + 1 ? "text-[var(--color-on-surface-variant)] border-l border-[var(--color-ink-graphite)] opacity-50" : "text-[var(--color-on-surface-variant)] border-l border-[var(--color-ink-graphite)]"}`} key={step}><span className="font-data-label text-xs pl-4">{String(index + 1).padStart(3, "0")}</span><strong className="font-data-label text-sm font-medium">{step}</strong></div>)}</aside>;
}

type EvidenceState = "WAIT" | "RUNNING" | "PASS" | "WARN" | "CRITICAL";
export function EvidenceRow({ id, category, title, state, detail, children }: { id: string; category: string; title: string; state: EvidenceState; detail?: string; children?: ReactNode }) {
  const Icon = state === "PASS" ? Check : state === "WARN" || state === "CRITICAL" ? CircleAlert : state === "RUNNING" ? LoaderCircle : CircleDashed;
  const stateColor = state === "PASS" ? "text-[var(--color-pass-moss)]" : state === "WARN" ? "text-[var(--color-evidence-amber)]" : state === "CRITICAL" ? "text-[var(--color-fail-clay)]" : "text-[var(--color-on-surface-variant)]";

  return (
    <article className="evidence-row flex gap-4 p-6 border-b border-[var(--color-surface-variant)] hover:bg-[var(--color-surface-container)] transition-colors border-l-2 border-l-transparent hover:border-l-[var(--color-seal-indigo)] group relative">
      <div className={`mt-1 absolute -left-[9px] top-6 w-4 h-4 bg-[var(--color-paper-cream)] border border-[var(--color-ink-graphite)] rounded-full group-hover:border-[var(--color-seal-indigo)] transition-colors flex items-center justify-center`}>
        <div className={`w-1.5 h-1.5 rounded-full ${state === 'PASS' ? 'bg-[var(--color-pass-moss)]' : state === 'WARN' ? 'bg-[var(--color-evidence-amber)]' : state === 'CRITICAL' ? 'bg-[var(--color-fail-clay)]' : 'bg-[var(--color-on-surface-variant)]'}`}></div>
      </div>
      <div className="flex-1 ml-4">
        <div className="flex justify-between items-center mb-2 font-data-label text-xs text-[var(--color-on-surface-variant)]">
          <span>{id} / {category}</span>
          <b className={stateColor}>{state}</b>
        </div>
        <h3 className="font-data-label text-sm font-bold text-[var(--color-ink-graphite)] group-hover:text-[var(--color-seal-indigo)] transition-colors mb-2">{title}</h3>
        {detail && <p className="font-body-md text-sm text-[var(--color-on-surface-variant)] mt-1">{detail}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </article>
  );
}

export function EvidenceLedger({ children, title = "EVIDENCE LEDGER" }: { children: ReactNode; title?: string }) {
  return (
    <div className="workspace-panel evidence-ledger">
      <div className="flex justify-between p-4 border-b border-[var(--color-ink-graphite)] bg-[var(--color-surface-container-low)] font-data-label text-xs text-[var(--color-ink-graphite)]">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--color-ink-graphite)]"></span>{title}</span>
        <span className="text-[var(--color-on-surface-variant)]">EVENT / ASSERTION / RESULT</span>
      </div>
      <div className="bg-[var(--color-paper-cream)]">{children}</div>
    </div>
  );
}

export function ReportSheet({ children }: { children: ReactNode }) {
  return <section className="workspace-panel report-sheet">
    <div className="border border-[var(--color-ink-graphite)] bg-[var(--color-paper-cream)] overflow-hidden">
      {children}
    </div>
  </section>;
}

export function ReportMetaGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 mb-8 border-b border-[var(--color-ink-graphite)] pb-8 pt-8 px-8">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col">
          <span className="font-data-label text-xs text-[var(--color-on-surface-variant)] uppercase mb-2">{item.label}</span>
          <strong className="font-data-value text-base font-medium text-[var(--color-ink-graphite)]">{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function StatusLine({ status, label = "VERIFICATION STATUS" }: { status: VerificationStatus; label?: string }) {
  return (
    <div className="flex justify-between items-center px-8 py-4 border-b border-[var(--color-ink-graphite)] bg-[var(--color-surface-container-low)]">
      <span className="font-data-label text-sm text-[var(--color-ink-graphite)]">{label}</span>
      <StatusPill status={status} />
    </div>
  );
}
