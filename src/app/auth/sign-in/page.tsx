"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ArrowRight, Eye, EyeOff, Mail, ShieldCheck, Zap } from "lucide-react";

async function post(path: string, body: Record<string, string>) {
  const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    try { await post("/api/auth/sign-in", { email: String(data.get("email")), password: String(data.get("password")) }); router.push("/dashboard"); router.refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Sign-in failed."); }
    finally { setBusy(false); }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      if (!resetSent) { await post("/api/auth/forgot-password", { email: String(data.get("email")) }); setResetSent(true); setMessage("A reset code was sent to your email."); }
      else { await post("/api/auth/reset-password", { email: String(data.get("email")), code: String(data.get("code")), password: String(data.get("password")) }); setResetMode(false); setResetSent(false); setMessage("Password reset. Sign in with the new password."); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Password reset failed."); }
    finally { setBusy(false); }
  }

  return <main className="lp-split-auth"><div className="lp-split-auth__left"><header className="lp-split-auth__header"><Link href="/" className="lp-split-auth__logo"><Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={32} style={{ objectFit: "contain" }} /></Link><Link href="/" className="lp-split-auth__back"><ArrowLeft size={16} />Back to Home</Link></header><div className="lp-split-auth__form-wrapper"><div className="lp-split-auth__form-header"><h1 className="lp-split-auth__title">{resetMode ? "Reset Access" : "Access Portal"}</h1><p className="lp-split-auth__subtitle">{resetMode ? "Restore access with your verified email." : "Enter your credentials to access verified evidence."}</p></div><form onSubmit={resetMode ? handleReset : handleSignIn} className="lp-auth-form"><div className="lp-auth-form__group"><label htmlFor="email">Email Address</label><div className="lp-auth-form__input-wrapper"><input id="email" name="email" required type="email" placeholder="user@example.com" /><Mail className="lp-auth-form__icon" size={18} /></div></div>{resetSent && <div className="lp-auth-form__group"><label htmlFor="code">Reset Code</label><div className="lp-auth-form__input-wrapper"><input id="code" name="code" required inputMode="numeric" maxLength={6} placeholder="123456" /></div></div>}<div className="lp-auth-form__group"><label htmlFor="password">{resetMode && !resetSent ? "New Password (after code)" : "Password"}</label><div className="lp-auth-form__input-wrapper"><input id="password" name="password" required={!resetMode || resetSent} type={showPassword ? "text" : "password"} placeholder="••••••••" /><button type="button" className="lp-auth-form__icon-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>{!resetMode && <div className="lp-auth-form__actions"><span /><button type="button" className="lp-auth-form__forgot" onClick={() => { setResetMode(true); setMessage(""); }}>Reset Key?</button></div>}{message && <p className="lp-auth-form__terms">{message}</p>}<button disabled={busy} type="submit" className="lp-btn lp-btn--primary lp-auth-form__submit">{busy ? "Processing" : resetMode ? resetSent ? "Confirm reset" : "Send reset code" : "Initialize Session"}<ArrowRight size={18} /></button>{resetMode ? <p className="lp-auth-form__switch"><button type="button" onClick={() => { setResetMode(false); setResetSent(false); }}>Return to sign in</button></p> : <p className="lp-auth-form__switch">Don&apos;t have access? <Link href="/auth/sign-up">Request access</Link></p>}</form></div><footer className="lp-split-auth__footer">© 2026 AgentProof. Forensic Authority in AI Verification.</footer></div><AuthVisual /></main>;
}

function AuthVisual() { return <div className="lp-split-auth__right"><Image src="/auth-bg.jpg" alt="" fill priority style={{ objectFit: "cover", zIndex: 0 }} /><div className="lp-split-auth__right-inner"><div className="lp-auth-deliverables"><Deliverable icon={<ShieldCheck size={24} />} title="Immutable Audits" copy="Every tool call and state change is cryptographically hashed for complete transparency." /><Deliverable icon={<Zap size={24} />} title="Automated Adversarial Testing" copy="Stop prompt-guessing. We generate thousands of edge cases to verify boundaries." /><Deliverable icon={<Activity size={24} />} title="Live Telemetry" copy="Monitor your agent's reliability score in real-time as it interacts with users." /></div></div></div>; }
function Deliverable({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="lp-auth-deliverable"><div className="lp-auth-deliverable__icon">{icon}</div><div><h4>{title}</h4><p>{copy}</p></div></div>; }
