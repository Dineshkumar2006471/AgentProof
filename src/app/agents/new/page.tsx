"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileCode2, LoaderCircle, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StepRail } from "@/components/proof-ui";
import type { EndpointAuthType } from "@/lib/endpoint-auth";
import { captureAnalytics } from "@/lib/analytics";

type ContractDraft = Record<string, unknown> & { id?: string; version?: string };
type GeneratedTest = Record<string, unknown> & { id?: string; type?: string; inputMessage?: string; expectedBehavior?: string };

type WizardState = {
  name: string;
  version: string;
  endpointUrl: string;
  endpointAuthType: EndpointAuthType;
  endpointAuthToken: string;
  endpointAuthUsername: string;
  endpointAuthHeaderName: string;
  description: string;
  mustNeverDo: string;
  successCriteria: string;
};

const initialState: WizardState = {
  name: "",
  version: "1.0.0",
  endpointUrl: "",
  endpointAuthType: "none",
  endpointAuthToken: "",
  endpointAuthUsername: "",
  endpointAuthHeaderName: "x-api-key",
  description: "",
  mustNeverDo: "",
  successCriteria: ""
};

async function requestJson(path: string, init: RequestInit) {
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "The request could not be completed.");
  return payload;
}

export default function NewAgent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialState);
  const [agentId, setAgentId] = useState("");
  const [contractId, setContractId] = useState("");
  const [contract, setContract] = useState<ContractDraft | null>(null);
  const [tests, setTests] = useState<GeneratedTest[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  async function draftContract() {
    setError("");
    if (formData.name.trim().length < 2) return setError("Enter an agent name.");
    if (!formData.version.trim()) return setError("Enter a version identifier.");
    try {
      new URL(formData.endpointUrl);
    } catch {
      return setError("Enter a valid HTTPS endpoint URL.");
    }
    if (!formData.endpointUrl.startsWith("https://")) return setError("The agent endpoint must use HTTPS.");
    if (formData.description.trim().length < 20) return setError("Describe the agent in at least 20 characters.");
    if ((formData.endpointAuthType === "bearer" || formData.endpointAuthType === "api_key") && !formData.endpointAuthToken) return setError(formData.endpointAuthType === "bearer" ? "Enter the bearer token for this endpoint." : "Enter the API key for this endpoint.");
    if (formData.endpointAuthType === "basic" && (!formData.endpointAuthUsername || !formData.endpointAuthToken)) return setError("Enter the Basic authentication username and password for this endpoint.");

    setBusy(true);
    try {
      let currentAgentId = agentId;
      if (!currentAgentId) {
        const created = await requestJson("/api/agents", { method: "POST", body: JSON.stringify(formData) });
        const createdAgent = created.agent as { id?: string } | undefined;
        if (!createdAgent?.id) throw new Error("Agent creation returned no agent ID.");
        currentAgentId = createdAgent.id;
        setAgentId(currentAgentId);
        captureAnalytics("agent_created", { endpoint_authentication: formData.endpointAuthType });
      }
      const result = await requestJson(`/api/agents/${currentAgentId}/contract/draft`, { method: "POST", body: JSON.stringify(formData) });
      const nextContract = result.contractDraft as ContractDraft | undefined;
      if (!nextContract?.id) throw new Error("Contract drafting returned no contract ID.");
      setContract(nextContract);
      setContractId(nextContract.id);
      setStep(2);
      captureAnalytics("contract_drafted");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Contract drafting failed.");
    } finally {
      setBusy(false);
    }
  }

  async function generateTests() {
    if (!agentId || !contractId) return setError("Draft a contract before generating tests.");
    setError("");
    setBusy(true);
    try {
      const result = await requestJson(`/api/agents/${agentId}/generate-tests`, { method: "POST", body: JSON.stringify({ contractId }) });
      setTests((result.tests as GeneratedTest[] | undefined) ?? []);
      setStep(3);
      captureAnalytics("test_matrix_generated", { test_count: (result.tests as GeneratedTest[] | undefined)?.length ?? 0 });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Test generation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function startVerification() {
    if (!agentId || !contractId) return setError("Generate tests before starting verification.");
    setError("");
    setBusy(true);
    try {
      const result = await requestJson(`/api/agents/${agentId}/run`, { method: "POST", body: JSON.stringify({ contractId }) });
      const run = result.run as { id?: string } | undefined;
      if (!run?.id) throw new Error("Verification queue returned no run ID.");
      captureAnalytics("verification_started", { test_count: tests.length });
      router.push(`/agents/${agentId}/run?run=${encodeURIComponent(run.id)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Verification could not be queued.");
      setBusy(false);
    }
  }

  const stepLabels = ["IDENTITY", "CONTRACT", "TEST MATRIX"];

  return (
    <AppShell title="New agent" section="CONTRACT DRAFTING">
      <div className="workspace-page">
        <header className="workspace-page-header">
          <div className="workspace-page-header__copy">
            <span className="eyebrow">CONTRACT DRAFTING / NEW AGENT</span>
            <h2 className="workspace-heading mt-3">Make the promise testable</h2>
            <p className="body-lg mt-3 max-w-2xl">Turn an agent&apos;s plain-language claims into a versioned contract and an executable test matrix.</p>
          </div>
        </header>

        <div className="workflow-stepper" aria-label="Agent creation progress">
          <StepRail current={step} steps={stepLabels} orientation="horizontal" />
        </div>
        {error && <p role="alert" className="workspace-alert workspace-alert--error">{error}</p>}

        <div className="creation-grid">
          <div className="creation-workflow">
            <AnimatePresence mode="wait">
              {step === 1 && <motion.section key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="workspace-panel workflow-panel">
                <div className="workspace-panel__header"><span className="eyebrow">STEP 01 / IDENTITY</span><h2 className="workspace-panel__title mt-2">Describe your agent</h2><p className="workspace-panel__body">Start with the deployment details and the promise that should be tested.</p></div>
                <div className="workflow-panel__body grid gap-6 md:grid-cols-2">
                  <label className="field-label">Agent name<input className="field-input" value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Dental Clinic Scheduler" /></label>
                  <label className="field-label">Version identifier<input className="field-input" value={formData.version} onChange={(e) => updateField("version", e.target.value)} placeholder="1.0.0" /></label>
                  <label className="field-label md:col-span-2">Live endpoint / POST /run<input className="field-input" value={formData.endpointUrl} onChange={(e) => updateField("endpointUrl", e.target.value)} placeholder="https://your-agent-url.com/run" /></label>
                  <label className="field-label">Endpoint authentication<select className="field-input" value={formData.endpointAuthType} onChange={(e) => updateField("endpointAuthType", e.target.value as WizardState["endpointAuthType"])}><option value="none">No authentication</option><option value="bearer">Bearer token</option><option value="api_key">API key</option><option value="basic">Basic authentication</option></select></label>
                  {formData.endpointAuthType === "bearer" && <label className="field-label">Bearer token<input type="password" className="field-input" value={formData.endpointAuthToken} onChange={(e) => updateField("endpointAuthToken", e.target.value)} placeholder="Stored securely" /></label>}
                  {formData.endpointAuthType === "api_key" && <div className="grid gap-6 md:col-span-2 md:grid-cols-2"><label className="field-label">API key<input type="password" className="field-input" value={formData.endpointAuthToken} onChange={(e) => updateField("endpointAuthToken", e.target.value)} placeholder="Stored securely" /></label><label className="field-label">API key header<input className="field-input" value={formData.endpointAuthHeaderName} onChange={(e) => updateField("endpointAuthHeaderName", e.target.value)} placeholder="x-api-key" /></label></div>}
                  {formData.endpointAuthType === "basic" && <div className="grid gap-6 md:col-span-2 md:grid-cols-2"><label className="field-label">Basic username<input className="field-input" value={formData.endpointAuthUsername} onChange={(e) => updateField("endpointAuthUsername", e.target.value)} autoComplete="username" /></label><label className="field-label">Basic password<input type="password" className="field-input" value={formData.endpointAuthToken} onChange={(e) => updateField("endpointAuthToken", e.target.value)} autoComplete="current-password" placeholder="Stored securely" /></label></div>}
                  <label className="field-label md:col-span-2">What can your agent do?<textarea rows={4} className="field-input" value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="e.g. book appointments, answer FAQs, reschedule..." /></label>
                  <label className="field-label">Must never do<textarea rows={3} className="field-input" value={formData.mustNeverDo} onChange={(e) => updateField("mustNeverDo", e.target.value)} placeholder="e.g. diagnose a patient" /></label>
                  <label className="field-label">Success criteria<textarea rows={3} className="field-input" value={formData.successCriteria} onChange={(e) => updateField("successCriteria", e.target.value)} placeholder="e.g. confirm only after availability is checked" /></label>
                </div>
                <div className="workflow-panel__actions"><button type="button" disabled={busy} onClick={draftContract} className="action-button action-button--primary">{busy ? <LoaderCircle className="animate-spin" size={15} /> : <ArrowRight size={15} />} {busy ? "Drafting..." : "Continue to Contract"}</button></div>
              </motion.section>}

              {step === 2 && <motion.section key="contract" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="workspace-panel workflow-panel overflow-hidden">
                <div className="workspace-panel__header"><span className="eyebrow">STEP 02 / CONTRACT</span><h2 className="workspace-panel__title mt-2">Review agent contract</h2><p className="workspace-panel__body">Review the generated contract before the test matrix is created.</p></div>
                <pre className="workflow-contract-preview">{JSON.stringify(contract, null, 2)}</pre>
                <div className="workflow-panel__actions"><button type="button" disabled={busy} onClick={() => setStep(1)} className="action-button action-button--quiet">Back</button><button type="button" disabled={busy} onClick={generateTests} className="action-button action-button--primary">{busy ? <LoaderCircle className="animate-spin" size={15} /> : <Save size={15} />} {busy ? "Generating..." : "Generate Test Matrix"}</button></div>
              </motion.section>}

              {step === 3 && <motion.section key="tests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="workspace-panel workflow-panel">
                <div className="workspace-panel__header workflow-panel__header-row"><div><span className="eyebrow">STEP 03 / TEST MATRIX</span><h2 className="workspace-panel__title mt-2">Tests generated</h2><p className="workspace-panel__body">{tests.length} executable scenarios are ready for the first verification run.</p></div><FileCode2 className="text-[var(--color-pass-moss)]" size={28} /></div>
                <div className="workflow-test-list">{tests.map((test, index) => <div key={String(test.id ?? index)} className="workflow-test-row"><span className="eyebrow">{String(test.type ?? "test").toUpperCase()}</span><div><strong className="font-mono text-sm">{String(test.inputMessage ?? "Untitled test")}</strong><p className="body-md mt-1">Expected: {String(test.expectedBehavior ?? "No expected behavior recorded.")}</p></div></div>)}</div>
                <div className="workflow-panel__actions"><button type="button" disabled={busy} onClick={() => setStep(2)} className="action-button action-button--quiet">Back</button><button type="button" disabled={busy || tests.length === 0} onClick={startVerification} className="action-button action-button--primary">{busy ? <LoaderCircle className="animate-spin" size={15} /> : <ArrowRight size={15} />} {busy ? "Queueing..." : "Run Verification"}</button></div>
              </motion.section>}
            </AnimatePresence>
          </div>

          <aside className="workflow-aside">
            <div className="workspace-panel workflow-summary">
              <div className="workspace-panel__header"><span className="eyebrow">LIVE WORKFLOW</span><h2 className="workspace-panel__title mt-2">Verification path</h2></div>
              <ol className="workflow-summary__steps">
                {stepLabels.map((label, index) => <li key={label} className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{label}</strong><small>{index === 0 ? "Deployment identity" : index === 1 ? "Versioned promise" : "Executable scenarios"}</small></div></li>)}
              </ol>
            </div>
            <div className="workspace-panel workflow-summary workflow-summary--quiet">
              <span className="eyebrow">DRAFT STATE</span>
              <strong className="workflow-summary__value">{formData.name || "Unnamed agent"}</strong>
              <dl className="workflow-summary__details"><div><dt>VERSION</dt><dd>{formData.version || "--"}</dd></div><div><dt>ENDPOINT</dt><dd>{formData.endpointUrl ? "Configured" : "Awaiting input"}</dd></div><div><dt>CONTRACT</dt><dd>{contractId ? "Drafted" : "Not drafted"}</dd></div><div><dt>TESTS</dt><dd>{tests.length ? `${tests.length} ready` : "Not generated"}</dd></div></dl>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
