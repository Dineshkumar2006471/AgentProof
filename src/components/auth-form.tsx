"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { captureAnalytics, identifyAnalytics } from "@/lib/analytics";
import { policyLinks } from "@/lib/policies";

type AuthMode = "sign-in" | "sign-up" | "forgot-password" | "reset-password";

type AuthFormProps = { mode: AuthMode };

type ApiResponse = { error?: string; confirmationRequired?: boolean; userSub?: string; authorizeUrl?: string };

async function postAuth(path: string, body: Record<string, string | boolean | undefined>) {
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

function Field({ id, label, type = "text", placeholder, value, required = true, onChange, inputMode, minLength, hint, autoComplete }: {
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
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2" htmlFor={id}>{label}</label>
      <input type={type} id={id} inputMode={inputMode} autoComplete={autoComplete} minLength={minLength} aria-describedby={hint ? `${id}-hint` : undefined} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-[var(--color-surface-bright)] border border-[var(--color-outline-variant)] rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-seal-indigo)] focus:ring-1 focus:ring-[var(--color-seal-indigo)] transition-colors" placeholder={placeholder} />
      {hint && <p id={`${id}-hint`} className="mt-2 text-xs text-[var(--color-on-surface-variant)]">{hint}</p>}
    </div>
  );
}

function initialOauthError() {
  if (typeof window === "undefined") return "";
  const oauthError = new URLSearchParams(window.location.search).get("oauth_error");
  if (!oauthError) return "";
  return oauthError === "cancelled" ? "Google sign-in was cancelled." : "Google sign-in could not be completed. Please try again.";
}

function PasswordField({ id = "password", label = "Password", value, onChange, autoComplete, showHint = true }: {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  showHint?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const describedBy = [showHint ? `${id}-hint` : "", capsLock ? `${id}-caps-lock` : ""].filter(Boolean).join(" ");

  return <div>
    <label className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2" htmlFor={id}>{label}</label>
    <div className="relative">
      <input type={visible ? "text" : "password"} id={id} autoComplete={autoComplete} maxLength={128} required value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))} onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))} onBlur={() => setCapsLock(false)} aria-describedby={describedBy} className="w-full bg-[var(--color-surface-bright)] border border-[var(--color-outline-variant)] rounded-md px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[var(--color-seal-indigo)] focus:ring-1 focus:ring-[var(--color-seal-indigo)] transition-colors" placeholder="••••••••" />
      <button type="button" onClick={() => setVisible((current) => !current)} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-[var(--color-on-surface-variant)] hover:text-[var(--color-seal-indigo)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-seal-indigo)]" aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
    {showHint && <p id={`${id}-hint`} className="mt-2 text-xs text-[var(--color-on-surface-variant)]">Any characters are allowed. Use 8 or more.</p>}
    {capsLock && <p id={`${id}-caps-lock`} role="status" className="mt-2 text-xs text-[var(--color-evidence-amber)]">Caps Lock is on.</p>}
  </div>;
}

declare global {
  interface Window {
    turnstile?: { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback": () => void; "expired-callback": () => void; theme: "light" }) => string; remove: (id: string) => void };
  }
}

function TurnstileField({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const target = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !target.current) return;
    const render = () => {
      if (!target.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(target.current, { sitekey: siteKey, theme: "light", callback: onToken, "error-callback": () => onToken(""), "expired-callback": () => onToken("") });
    };
    const existing = document.getElementById("agentproof-turnstile");
    if (existing) {
      existing.addEventListener("load", render);
      render();
    } else {
      const script = document.createElement("script");
      script.id = "agentproof-turnstile";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render);
      document.head.appendChild(script);
    }
    return () => { if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); };
  }, [onToken, siteKey]);

  if (!siteKey) return null;
  return <div><span className="block text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">Security check</span><div ref={target} /></div>;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState(mode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(initialOauthError);
  const [submitting, setSubmitting] = useState(false);
  const [googleWorking, setGoogleWorking] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN_ENABLED === "true";

  const isConfirmation = currentMode === "sign-up" && confirmationRequired;
  const title = currentMode === "sign-in" ? "Sign In to AgentProof" : currentMode === "sign-up" ? (isConfirmation ? "Confirm Your Email" : "Create an Account") : currentMode === "forgot-password" ? "Reset Your Password" : "Choose a New Password";
  const submitLabel = submitting ? "Working..." : currentMode === "sign-in" ? "Sign In" : currentMode === "sign-up" ? (isConfirmation ? "Confirm Email" : "Sign Up") : currentMode === "forgot-password" ? "Send Reset Code" : "Reset Password";

  async function continueWithGoogle() {
    if (currentMode === "sign-up" && !acceptedPolicies) {
      setError("Accept the Terms and Privacy Policy to continue with Google.");
      return;
    }

    setError("");
    setGoogleWorking(true);
    try {
      const result = await postAuth("/api/auth/google/start", {
        intent: currentMode === "sign-up" ? "sign-up" : "sign-in",
        next: safeNextPath(),
        acceptedPolicies,
        captchaToken: captchaToken || undefined
      });
      if (!result.authorizeUrl) throw new Error("Google sign-in is not available yet.");
      window.location.assign(result.authorizeUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in could not be completed.");
      setGoogleWorking(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      if (currentMode === "sign-in") {
        await postAuth("/api/auth/sign-in", { email, password });
        captureAnalytics("account_signed_in");
        router.push(safeNextPath());
      } else if (currentMode === "sign-up" && !isConfirmation) {
        const result = await postAuth("/api/auth/sign-up", { name, email, password, acceptedPolicies, captchaToken: captchaToken || undefined });
        if (result.userSub) identifyAnalytics(result.userSub);
        captureAnalytics("account_signed_up");
        if (result.confirmationRequired !== false) setConfirmationRequired(true);
        else router.push("/dashboard");
      } else if (currentMode === "sign-up") {
        await postAuth("/api/auth/confirm-sign-up", { email, code });
        captureAnalytics("account_confirmed");
        router.push("/auth/sign-in?confirmed=1");
      } else if (currentMode === "forgot-password") {
        await postAuth("/api/auth/forgot-password", { email, captchaToken: captchaToken || undefined });
        setMessage("A reset code has been sent. Enter it below.");
        setCurrentMode("reset-password");
      } else {
        await postAuth("/api/auth/reset-password", { email, code, password });
        router.push("/auth/sign-in?reset=1");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The request could not be completed.");
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], input, button")?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[var(--color-paper-cream)] min-h-screen font-mono text-[var(--color-ink-graphite)] selection:bg-[var(--color-seal-indigo)] selection:text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[var(--color-outline-variant)] shadow-sm rounded-lg p-8">
        <div className="flex justify-center mb-10"><Link href="/"><Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={34} priority style={{ mixBlendMode: "multiply" }} /></Link></div>
        <h1 className="text-2xl font-bold text-center mb-8 tracking-tighter uppercase">{title}</h1>
        {currentMode === "sign-up" && !isConfirmation && <p className="mb-6 border-l-2 border-[var(--color-evidence-amber)] pl-3 text-sm text-[var(--color-on-surface-variant)]">Create your account, confirm your email, and start verifying agents.</p>}
        {message && <p role="status" aria-live="polite" className="mb-6 border-l-2 border-[var(--color-pass-moss)] pl-3 text-sm text-[var(--color-pass-moss)]">{message}</p>}
        {error && <p role="alert" aria-live="assertive" className="mb-6 border-l-2 border-[var(--color-fail-clay)] pl-3 text-sm text-[var(--color-fail-clay)]">{error}</p>}
        <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
          {currentMode === "sign-up" && !isConfirmation && <Field id="name" label="Full Name" placeholder="Jane Doe" autoComplete="name" value={name} onChange={setName} />}
          <Field id="email" label="Email Address" type="email" placeholder="name@agency.com" autoComplete="email" value={email} onChange={setEmail} />
          {isConfirmation && <Field id="code" label="Confirmation Code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={setCode} />}
          {currentMode === "sign-in" && <div><div className="mb-2 flex justify-end"><Link href="/auth/forgot-password" className="text-xs text-[var(--color-seal-indigo)] hover:underline">Forgot password?</Link></div><PasswordField label="Password" value={password} onChange={setPassword} autoComplete="current-password" showHint={false} /></div>}
          {currentMode === "sign-up" && !isConfirmation && <PasswordField value={password} onChange={setPassword} autoComplete="new-password" />}
          {currentMode === "forgot-password" && <p className="text-sm text-[var(--color-on-surface-variant)]">We will send a six-digit code to your email address.</p>}
          {currentMode === "reset-password" && <><Field id="code" label="Reset Code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={setCode} /><PasswordField label="New Password" value={password} onChange={setPassword} autoComplete="new-password" /></>}
          {(currentMode === "sign-up" && !isConfirmation) && <><label className="flex items-start gap-3 text-xs leading-relaxed text-[var(--color-on-surface-variant)]"><input type="checkbox" checked={acceptedPolicies} onChange={(event) => setAcceptedPolicies(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-seal-indigo)]" required /> <span>I agree to the <Link href={policyLinks.terms} className="text-[var(--color-seal-indigo)] underline">Terms</Link> and <Link href={policyLinks.privacy} className="text-[var(--color-seal-indigo)] underline">Privacy Policy</Link>.</span></label><TurnstileField onToken={setCaptchaToken} /></>}
          {currentMode === "forgot-password" && <TurnstileField onToken={setCaptchaToken} />}
          <button type="submit" disabled={submitting} className="w-full bg-[var(--color-seal-indigo)] text-white text-sm font-bold uppercase tracking-widest py-4 rounded-md hover:bg-[#2A354C] disabled:opacity-60 disabled:cursor-wait transition-colors shadow-sm mt-4">{submitLabel}</button>
          {googleEnabled && (currentMode === "sign-in" || (currentMode === "sign-up" && !isConfirmation)) && <><div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)]" aria-hidden="true"><span className="h-px flex-1 bg-[var(--color-outline-variant)]" />or continue with<span className="h-px flex-1 bg-[var(--color-outline-variant)]" /></div><button type="button" disabled={submitting || googleWorking} onClick={continueWithGoogle} className="flex w-full items-center justify-center gap-3 border border-[var(--color-outline-variant)] bg-white py-3 text-sm font-bold text-[var(--color-ink-graphite)] transition-colors hover:bg-[var(--color-surface-container)] disabled:cursor-wait disabled:opacity-60"><Image src="/google-g-logo.svg" alt="" width={18} height={18} aria-hidden="true" />{googleWorking ? "Opening Google..." : "Continue with Google"}</button></>}
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
