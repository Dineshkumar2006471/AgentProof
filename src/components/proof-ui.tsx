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
  const className = `action-button action-button--${variant}`;
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
    <header className="page-header reveal-up">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {meta && <div className="page-header__meta">{meta}</div>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

export function ProofPanel({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  return <section className={`proof-panel ${dark ? "proof-panel--dark" : ""} ${className}`}>{children}</section>;
}

export function MetricStrip({ metrics }: { metrics: Array<{ label: string; value: string; tone?: "pass" | "warn" | "fail" | "default" }> }) {
  return <div className="metric-strip">{metrics.map((metric) => <div className="metric-strip__item" key={metric.label}><span>{metric.label}</span><strong className={`tone-${metric.tone ?? "default"}`}>{metric.value}</strong></div>)}</div>;
}

export function ContractWindow({ title = "OPERATIONAL CONTRACT", children }: { title?: string; children: ReactNode }) {
  return <div className="contract-window"><div className="contract-window__bar"><span>{title}</span><span className="contract-window__lock">LOCKED / v1.4</span></div><div className="contract-window__body">{children}</div></div>;
}

export function TerminalWindow({ children, title = "agentproof-runner:stdout" }: { children: ReactNode; title?: string }) {
  return <div className="terminal-window"><div className="terminal-header"><div className="terminal-dots"><i /><i /><i /></div><span>{title}</span></div><div className="terminal-body">{children}</div></div>;
}

export function StepRail({ current, steps, orientation = "vertical" }: { current: number; steps: string[]; orientation?: "vertical" | "horizontal" }) {
  return <aside className={`step-rail step-rail--${orientation}`} aria-label="Agent evaluation steps">{steps.map((step, index) => <div className={`step-rail__item ${current === index + 1 ? "is-current" : ""} ${current > index + 1 ? "is-complete" : ""}`} key={step}><span>{String(index + 1).padStart(3, "0")}</span><strong>{step}</strong></div>)}</aside>;
}

type EvidenceState = "WAIT" | "RUNNING" | "PASS" | "WARN" | "CRITICAL";
export function EvidenceRow({ id, category, title, state, detail, children }: { id: string; category: string; title: string; state: EvidenceState; detail?: string; children?: ReactNode }) {
  const Icon = state === "PASS" ? Check : state === "WARN" || state === "CRITICAL" ? CircleAlert : state === "RUNNING" ? LoaderCircle : CircleDashed;
  return <article className={`evidence-ledger__row evidence-ledger__row--${state.toLowerCase()}`}><div className="evidence-ledger__icon"><Icon size={16} /></div><div className="evidence-ledger__main"><div className="evidence-ledger__top"><span>{id} / {category}</span><b>{state}</b></div><h3>{title}</h3>{detail && <p>{detail}</p>}{children}</div></article>;
}

export function EvidenceLedger({ children, title = "EVIDENCE LEDGER" }: { children: ReactNode; title?: string }) {
  return <div className="evidence-ledger"><div className="evidence-ledger__header"><span>{title}</span><span>EVENT / ASSERTION / RESULT</span></div>{children}</div>;
}

export function ReportSheet({ children }: { children: ReactNode }) {
  return <section className="report-sheet">{children}</section>;
}

export function ReportMetaGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return <div className="report-meta-grid">{items.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div>;
}

export function StatusLine({ status, label = "VERIFICATION STATUS" }: { status: VerificationStatus; label?: string }) {
  return <div className="status-line"><span>{label}</span><StatusPill status={status} /></div>;
}
