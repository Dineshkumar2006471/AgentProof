"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

type AuthFormProps = { mode: AuthMode };

type ApiResponse = { error?: string; confirmationRequired?: boolean };

async function postAuth(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? ((await response.json().catch(() => ({}))) as ApiResponse) : {};
  if (!response.ok) {
    throw new Error(payload.error || `${response.status} ${response.statusText || "Request failed"}. The authentication endpoint did not return a usable response.`);
  }
  return payload;
}

function safeNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function Field({ id, label, type = "text", placeholder, value, required = true, onChange, inputMode, minLength, hint }: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
  inputMode?: "numeric";
  minLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2" htmlFor={id}>{label}</label>
      <input type={type} id={id} inputMode={inputMode} minLength={minLength} aria-describedby={hint ? `${id}-hint` : undefined} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-[var(--color-surface-bright)] border border-[var(--color-outline-variant)] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-seal-indigo)] focus:ring-1 focus:ring-[var(--color-seal-indigo)] transition-colors" placeholder={placeholder} />
      {hint && <p id={`${id}-hint`} className="mt-2 text-xs text-[var(--color-on-surface-variant)]">{hint}</p>}
    </div>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isConfirmation = currentMode === "sign-up" && confirmationRequired;
  const title = currentMode === "sign-in" ? "Sign In to AgentProof" : currentMode === "sign-up" ? (isConfirmation ? "Confirm Your Email" : "Create an Account") : currentMode === "forgot-password" ? "Reset Your Password" : "Choose a New Password";
  const submitLabel = submitting ? "Working..." : currentMode === "sign-in" ? "Sign In" : currentMode === "sign-up" ? (isConfirmation ? "Confirm Email" : "Sign Up") : currentMode === "forgot-password" ? "Send Reset Code" : "Reset Password";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      if (currentMode === "sign-in") {
        await postAuth("/api/auth/sign-in", { email, password });
        router.push(safeNextPath());
      } else if (currentMode === "sign-up" && !isConfirmation) {
        const result = await postAuth("/api/auth/sign-up", { name, email, password });
        if (result.confirmationRequired !== false) setConfirmationRequired(true);
        else router.push("/dashboard");
      } else if (currentMode === "sign-up") {
        await postAuth("/api/auth/confirm-sign-up", { email, code });
        router.push("/auth/sign-in?confirmed=1");
      } else if (currentMode === "forgot-password") {
        await postAuth("/api/auth/forgot-password", { email });
        setMessage("A reset code has been sent. Enter it below.");
        setCurrentMode("reset-password");
      } else {
        await postAuth("/api/auth/reset-password", { email, code, password });
        router.push("/auth/sign-in?reset=1");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The request could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[var(--color-paper-cream)] min-h-screen font-mono text-[var(--color-ink-graphite)] selection:bg-[var(--color-seal-indigo)] selection:text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[var(--color-outline-variant)] shadow-sm rounded-lg p-8">
        <div className="flex justify-center mb-10"><Link href="/"><Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={34} priority style={{ mixBlendMode: "multiply" }} /></Link></div>
        <h1 className="text-2xl font-bold text-center mb-8 tracking-tighter uppercase">{title}</h1>
        {currentMode === "sign-up" && !isConfirmation && <p className="mb-6 border-l-2 border-[var(--color-evidence-amber)] pl-3 text-sm text-[var(--color-on-surface-variant)]">Open beta access for the cohort. Confirm your email to start testing.</p>}
        {message && <p className="mb-6 border-l-2 border-[var(--color-pass-moss)] pl-3 text-sm text-[var(--color-pass-moss)]">{message}</p>}
        {error && <p role="alert" className="mb-6 border-l-2 border-[var(--color-fail-clay)] pl-3 text-sm text-[var(--color-fail-clay)]">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {currentMode === "sign-up" && !isConfirmation && <Field id="name" label="Full Name" placeholder="Jane Doe" value={name} onChange={setName} />}
          <Field id="email" label="Email Address" type="email" placeholder="name@agency.com" value={email} onChange={setEmail} />
          {isConfirmation && <Field id="code" label="Confirmation Code" inputMode="numeric" placeholder="123456" value={code} onChange={setCode} />}
          {currentMode === "sign-in" && <div><div className="flex justify-between items-center mb-2"><label className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest" htmlFor="password">Password</label><Link href="/auth/forgot-password" className="text-xs text-[var(--color-seal-indigo)] hover:underline">Forgot password?</Link></div><input type="password" id="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-[var(--color-surface-bright)] border border-[var(--color-outline-variant)] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-seal-indigo)] focus:ring-1 focus:ring-[var(--color-seal-indigo)] transition-colors" placeholder="••••••••" /></div>}
          {currentMode === "sign-up" && !isConfirmation && <Field id="password" label="Password" type="password" placeholder="••••••••" minLength={8} hint="Use at least 8 characters." value={password} onChange={setPassword} />}
          {currentMode === "forgot-password" && <p className="text-sm text-[var(--color-on-surface-variant)]">We will send a six-digit code to your email address.</p>}
          {currentMode === "reset-password" && <><Field id="code" label="Reset Code" inputMode="numeric" placeholder="123456" value={code} onChange={setCode} /><Field id="password" label="New Password" type="password" placeholder="••••••••" minLength={8} hint="Use at least 8 characters." value={password} onChange={setPassword} /></>}
          <button type="submit" disabled={submitting} className="w-full bg-[var(--color-seal-indigo)] text-white text-sm font-bold uppercase tracking-widest py-4 rounded-md hover:bg-[#2A354C] disabled:opacity-60 disabled:cursor-wait transition-colors shadow-sm mt-4">{submitLabel}</button>
        </form>
        <div className="mt-8 text-center text-sm text-[var(--color-on-surface-variant)]">
          {currentMode === "sign-in" && <>Don&apos;t have an account? <Link href="/auth/sign-up" className="text-[var(--color-seal-indigo)] font-bold hover:underline">Sign up</Link></>}
          {currentMode === "sign-up" && !isConfirmation && <>Already have an account? <Link href="/auth/sign-in" className="text-[var(--color-seal-indigo)] font-bold hover:underline">Sign in</Link></>}
          {(currentMode === "forgot-password" || currentMode === "reset-password") && <Link href="/auth/sign-in" className="text-[var(--color-seal-indigo)] font-bold hover:underline">Back to sign in</Link>}
        </div>
      </div>
    </div>
  );
}
