"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ArrowRight, Eye, EyeOff, Mail, ShieldCheck, User, Zap } from "lucide-react";

async function post(path: string, body: Record<string, string>) {
  const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    try {
      if (confirming) { await post("/api/auth/confirm-sign-up", { email, code: String(data.get("code")) }); router.push("/auth/sign-in"); return; }
      const submittedEmail = String(data.get("email"));
      await post("/api/auth/sign-up", { name: String(data.get("name")), email: submittedEmail, password: String(data.get("password")) });
      setEmail(submittedEmail); setConfirming(true); setMessage("A six-digit confirmation code was sent to your email.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sign-up failed."); }
    finally { setBusy(false); }
  }

  return <main className="lp-split-auth"><div className="lp-split-auth__left"><header className="lp-split-auth__header"><Link href="/" className="lp-split-auth__logo"><Image src="/logo-agentproof.png" alt="AgentProof" width={140} height={32} style={{ objectFit: "contain" }} /></Link><Link href="/" className="lp-split-auth__back"><ArrowLeft size={16} />Back to Home</Link></header><div className="lp-split-auth__form-wrapper"><div className="lp-split-auth__form-header"><h1 className="lp-split-auth__title">{confirming ? "Confirm Access" : "Request Access"}</h1><p className="lp-split-auth__subtitle">{confirming ? "Enter the verification code sent to your email." : "Create your credentials for initial verification."}</p></div><form onSubmit={handleSubmit} className="lp-auth-form">{confirming ? <div className="lp-auth-form__group"><label htmlFor="code">Verification Code</label><div className="lp-auth-form__input-wrapper"><input id="code" name="code" required inputMode="numeric" maxLength={6} placeholder="123456" /></div></div> : <><div className="lp-auth-form__group"><label htmlFor="name">Full Name</label><div className="lp-auth-form__input-wrapper"><input id="name" name="name" required type="text" placeholder="John Doe" /><User className="lp-auth-form__icon" size={18} /></div></div><div className="lp-auth-form__group"><label htmlFor="email">Email Address</label><div className="lp-auth-form__input-wrapper"><input id="email" name="email" required type="email" placeholder="user@example.com" /><Mail className="lp-auth-form__icon" size={18} /></div></div><div className="lp-auth-form__group"><label htmlFor="password">Password</label><div className="lp-auth-form__input-wrapper"><input id="password" name="password" required minLength={12} type={showPassword ? "text" : "password"} placeholder="••••••••" /><button type="button" className="lp-auth-form__icon-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div><p className="lp-auth-form__terms">By submitting this request, you agree to our <Link href="#">Methodology</Link> and <Link href="#">Terms of Service</Link>.</p></>}{message && <p className="lp-auth-form__terms">{message}</p>}<button disabled={busy} type="submit" className="lp-btn lp-btn--primary lp-auth-form__submit" style={{ background: "var(--ink-graphite)", color: "var(--paper-cream)" }}>{busy ? "Processing" : confirming ? "Confirm Email" : "Submit Request"}<ArrowRight size={18} /></button>{!confirming && <p className="lp-auth-form__switch">Already have access? <Link href="/auth/sign-in">Initialize session</Link></p>}</form></div><footer className="lp-split-auth__footer">© 2026 AgentProof. Forensic Authority in AI Verification.</footer></div><AuthVisual /></main>;
}

function AuthVisual() { return <div className="lp-split-auth__right"><Image src="/auth-bg.jpg" alt="" fill priority style={{ objectFit: "cover", zIndex: 0 }} /><div className="lp-split-auth__right-inner"><div className="lp-auth-deliverables"><Deliverable icon={<ShieldCheck size={24} />} title="Immutable Audits" copy="Every tool call and state change is cryptographically hashed for complete transparency." /><Deliverable icon={<Zap size={24} />} title="Automated Adversarial Testing" copy="Stop prompt-guessing. We generate thousands of edge cases to verify boundaries." /><Deliverable icon={<Activity size={24} />} title="Live Telemetry" copy="Monitor your agent's reliability score in real-time as it interacts with users." /></div></div></div>; }
function Deliverable({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div className="lp-auth-deliverable"><div className="lp-auth-deliverable__icon">{icon}</div><div><h4>{title}</h4><p>{copy}</p></div></div>; }
