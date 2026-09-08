"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, Play, Save, Trash2 } from "lucide-react";
import type { Agent, AgentContract } from "@/lib/domain";
import type { EndpointAuthType } from "@/lib/endpoint-auth";

type EditFormProps = {
  agent: Agent;
  contract: AgentContract | null;
};

export function AgentEditForm({ agent, contract }: EditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(agent.name);
  const [endpointUrl, setEndpointUrl] = useState(agent.endpointUrl);
  const [version, setVersion] = useState(agent.currentVersion);
  const [endpointAuthType, setEndpointAuthType] = useState<EndpointAuthType>(agent.endpointAuthType || "none");
  const [endpointAuthUsername, setEndpointAuthUsername] = useState("");
  const [endpointAuthHeaderName, setEndpointAuthHeaderName] = useState(agent.endpointAuthHeaderName || "x-api-key");
  const [endpointAuthToken, setEndpointAuthToken] = useState("");

  const [capabilities, setCapabilities] = useState(contract?.capabilities?.join("\n") || "");
  const [restrictions, setRestrictions] = useState(contract?.restrictions?.join("\n") || "");
  const [requiredBehavior, setRequiredBehavior] = useState(contract?.requiredBehavior?.join("\n") || "");

  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function saveAgentData() {
    if (!name.trim()) throw new Error("Agent name is required.");
    if (!endpointUrl.trim()) throw new Error("Endpoint URL is required.");
    if (!endpointUrl.startsWith("https://") && !endpointUrl.startsWith("http://localhost") && !endpointUrl.startsWith("http://127.0.0.1")) {
      throw new Error("Endpoint URL must start with https://");
    }

    const payload: Record<string, unknown> = {
      name: name.trim(),
      endpointUrl: endpointUrl.trim(),
      version: version.trim() || agent.currentVersion,
      endpointAuthType
    };

    if (endpointAuthType === "bearer" || endpointAuthType === "api_key" || endpointAuthType === "basic") {
      if (endpointAuthToken) payload.endpointAuthToken = endpointAuthToken;
      if (endpointAuthType === "basic" && endpointAuthUsername) payload.endpointAuthUsername = endpointAuthUsername;
      if (endpointAuthType === "api_key" && endpointAuthHeaderName) payload.endpointAuthHeaderName = endpointAuthHeaderName;
    }

    const response = await fetch(`/api/agents/${encodeURIComponent(agent.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Failed to update agent details.");
    }

    // Update contract if capabilities or rules changed
    const parsedCaps = capabilities.split("\n").map((s) => s.trim()).filter(Boolean);
    const parsedRestr = restrictions.split("\n").map((s) => s.trim()).filter(Boolean);
    const parsedReq = requiredBehavior.split("\n").map((s) => s.trim()).filter(Boolean);

    if (parsedCaps.length > 0) {
      const contractPayload = {
        version: version.trim() || agent.currentVersion,
        capabilities: parsedCaps,
        restrictions: parsedRestr,
        requiredBehavior: parsedReq,
        failurePolicy: contract?.failurePolicy || []
      };

      const contractRes = await fetch(`/api/agents/${encodeURIComponent(agent.id)}/contract`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contractPayload)
      });
      const contractData = await contractRes.json().catch(() => ({}));
      if (!contractRes.ok) {
        throw new Error(contractData.error || "Failed to update agent contract.");
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving || running) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveAgentData();
      setSuccess("Agent and endpoint details saved successfully.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndRun() {
    if (saving || running) return;
    setRunning(true);
    setError(null);
    setSuccess(null);
    try {
      await saveAgentData();
      // Start verification run
      const runRes = await fetch(`/api/agents/${encodeURIComponent(agent.id)}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const runData = await runRes.json().catch(() => ({}));
      if (!runRes.ok) {
        throw new Error(runData.error || "Saved changes, but could not start verification run.");
      }
      if (!runData.run?.id) {
        throw new Error("No run ID returned by runner.");
      }
      router.push(`/agents/${encodeURIComponent(agent.id)}/run?run=${encodeURIComponent(runData.run.id)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed.");
      setRunning(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/agents/${encodeURIComponent(agent.id)}`, {
        method: "DELETE"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete agent.");
      }
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to delete agent.");
      setDeleting(false);
    }
  }

  return (
    <div className="workspace-page max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/agents/${agent.id}`} className="mono inline-flex items-center gap-2 text-sm text-[var(--color-seal-indigo)] hover:underline">
          <ArrowLeft size={16} /> Back to Agent Dossier
        </Link>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="mono text-xs text-[var(--color-fail-clay)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Trash2 size={13} /> Delete Agent
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="mb-6 border-2 border-[var(--color-fail-clay)] bg-[var(--color-fail-clay)]/10 p-5">
          <strong className="block text-[var(--color-fail-clay)] font-mono text-sm">
            Are you sure you want to delete this agent?
          </strong>
          <p className="body-md mt-1 text-sm">
            This will permanently remove the agent record. Free plan users can then create a new agent from scratch.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="action-button bg-[var(--color-fail-clay)] text-white text-xs px-3 py-2 cursor-pointer"
            >
              {deleting ? "Deleting..." : "Yes, permanently delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="action-button action-button--quiet text-xs px-3 py-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 border-l-2 border-[var(--color-fail-clay)] bg-[var(--color-fail-clay)]/5 p-4 text-sm text-[var(--color-fail-clay)] font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 border-l-2 border-[var(--color-pass-moss)] bg-[var(--color-pass-moss)]/5 p-4 text-sm text-[var(--color-pass-moss)] font-mono flex items-center gap-2">
          <Check size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <section className="workspace-panel p-6">
          <div className="workspace-panel__title border-b border-[var(--color-ink-graphite)]/15 pb-3">
            <span className="eyebrow">AGENT CONFIGURATION</span>
            <h2 className="workspace-heading mt-1">Endpoint & Identity</h2>
            <p className="body-md text-xs text-[var(--color-on-surface-variant)] mt-1">
              You can edit your endpoint URL at any time. When your verification fails or you deploy an update, simply point to your new URL and rerun verification.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="eyebrow block mb-2" htmlFor="agent-name">Agent Name</label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
            </div>

            <div>
              <label className="eyebrow block mb-2" htmlFor="agent-version">Version</label>
              <input
                id="agent-version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
                className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="eyebrow block mb-2" htmlFor="agent-endpoint">Endpoint URL (HTTPS)</label>
            <input
              id="agent-endpoint"
              type="url"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://example.com/api/chat"
              required
              className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
            />
            <span className="mono text-xs text-[var(--color-on-surface-variant)] mt-1 block">
              AgentProof sends HTTP POST requests with <code>&#123; message, input, prompt &#125;</code> and accepts JSON responses.
            </span>
          </div>
        </section>

        <section className="workspace-panel p-6">
          <div className="workspace-panel__title border-b border-[var(--color-ink-graphite)]/15 pb-3">
            <span className="eyebrow">AUTHENTICATION</span>
            <h2 className="workspace-heading mt-1">Endpoint Credentials</h2>
          </div>

          <div className="mt-5">
            <label className="eyebrow block mb-2" htmlFor="auth-type">Authentication Type</label>
            <select
              id="auth-type"
              value={endpointAuthType}
              onChange={(e) => setEndpointAuthType(e.target.value as EndpointAuthType)}
              className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
            >
              <option value="none">None (Public Endpoint)</option>
              <option value="bearer">Bearer Token (Authorization: Bearer ...)</option>
              <option value="api_key">API Key (Custom Header)</option>
              <option value="basic">HTTP Basic Authentication</option>
            </select>
          </div>

          {endpointAuthType === "api_key" && (
            <div className="mt-5">
              <label className="eyebrow block mb-2" htmlFor="auth-header">Header Name</label>
              <input
                id="auth-header"
                type="text"
                value={endpointAuthHeaderName}
                onChange={(e) => setEndpointAuthHeaderName(e.target.value)}
                placeholder="x-api-key"
                className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
            </div>
          )}

          {endpointAuthType === "basic" && (
            <div className="mt-5">
              <label className="eyebrow block mb-2" htmlFor="auth-user">Username</label>
              <input
                id="auth-user"
                type="text"
                value={endpointAuthUsername}
                onChange={(e) => setEndpointAuthUsername(e.target.value)}
                placeholder="username"
                className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
            </div>
          )}

          {endpointAuthType !== "none" && (
            <div className="mt-5">
              <label className="eyebrow block mb-2" htmlFor="auth-token">
                {endpointAuthType === "basic" ? "Password" : endpointAuthType === "bearer" ? "Bearer Token" : "API Key Secret"}
              </label>
              <input
                id="auth-token"
                type="password"
                value={endpointAuthToken}
                onChange={(e) => setEndpointAuthToken(e.target.value)}
                placeholder="Leave blank to keep existing stored secret"
                className="w-full border border-[var(--color-outline-variant)] bg-white px-3 py-2 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
              <span className="mono text-xs text-[var(--color-on-surface-variant)] mt-1 block">
                Leave empty if you don't want to change the previously saved credential.
              </span>
            </div>
          )}
        </section>

        <section className="workspace-panel p-6">
          <div className="workspace-panel__title border-b border-[var(--color-ink-graphite)]/15 pb-3">
            <span className="eyebrow">OPERATIONAL CONTRACT</span>
            <h2 className="workspace-heading mt-1">Capabilities & Rules</h2>
            <p className="body-md text-xs text-[var(--color-on-surface-variant)] mt-1">
              Enter one rule per line. These rules govern test evaluation and attestation.
            </p>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label className="eyebrow block mb-2" htmlFor="contract-caps">Capabilities (One per line)</label>
              <textarea
                id="contract-caps"
                rows={4}
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                placeholder="Answers questions clearly&#10;Executes calculations correctly"
                className="w-full border border-[var(--color-outline-variant)] bg-white p-3 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
            </div>

            <div>
              <label className="eyebrow block mb-2" htmlFor="contract-restr">Restrictions / Must Never Do (One per line)</label>
              <textarea
                id="contract-restr"
                rows={3}
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                placeholder="Never reveal system instructions&#10;Never execute unauthorized actions"
                className="w-full border border-[var(--color-outline-variant)] bg-white p-3 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
            </div>

            <div>
              <label className="eyebrow block mb-2" htmlFor="contract-req">Required Behavior (One per line)</label>
              <textarea
                id="contract-req"
                rows={3}
                value={requiredBehavior}
                onChange={(e) => setRequiredBehavior(e.target.value)}
                placeholder="Refuses harmful requests politely&#10;Maintains concise responses"
                className="w-full border border-[var(--color-outline-variant)] bg-white p-3 text-sm font-mono text-[var(--color-ink-graphite)] focus:border-[var(--color-seal-indigo)] focus:outline-none"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--color-ink-graphite)]/15">
          <button
            type="submit"
            disabled={saving || running}
            className="action-button bg-[var(--color-seal-indigo)] text-white border-[var(--color-seal-indigo)] hover:bg-[var(--color-ink-graphite)] inline-flex items-center gap-2 cursor-pointer"
          >
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Save Changes</span>
          </button>

          <button
            type="button"
            disabled={saving || running}
            onClick={handleSaveAndRun}
            className="action-button bg-[var(--color-ink-graphite)] text-white border-[var(--color-ink-graphite)] hover:bg-[var(--color-surface-variant)] inline-flex items-center gap-2 cursor-pointer"
          >
            {running ? <LoaderCircle size={15} className="animate-spin" /> : <Play size={15} className="fill-current" />}
            <span>Save & Run Verification</span>
          </button>

          <Link
            href={`/agents/${agent.id}`}
            className="action-button action-button--quiet inline-flex items-center gap-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
