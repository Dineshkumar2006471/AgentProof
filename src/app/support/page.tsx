import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Support", description: "Contact AgentProof support for account, billing, and verification help.", alternates: { canonical: "/support" } };

export default function SupportPage() {
  return <LegalPage title="Support" updatedAt="02 September 2026"><section><h2>Contact support</h2><p>Email support@agent-proof.dev for account access, billing, data requests, verification failures, or incident reports. Include the relevant agent name or report URL when available. Never send endpoint credentials, passwords, OTPs, or payment-card details by email.</p></section><section><h2>Security reports</h2><p>For a potential security issue, include a clear reproduction summary and impact. Do not attempt to access data that you do not own or control.</p></section><section><h2>Service status</h2><p>Verification work is asynchronous. If a run is delayed or fails, check the run record first and then contact support with the displayed run context.</p></section></LegalPage>;
}
