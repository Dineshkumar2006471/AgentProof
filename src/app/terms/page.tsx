import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Service", description: "Terms governing access to AgentProof.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" updatedAt="02 September 2026"><section><h2>Using AgentProof</h2><p>AgentProof helps teams test publicly reachable AI-agent endpoints against user-defined contracts. You are responsible for your endpoint, its authorization to be tested, its content, and the accuracy of the contract you provide.</p></section><section><h2>Acceptable use</h2><p>Do not use the service to test an endpoint without authorization, probe private networks, submit unlawful content, interfere with the service, bypass quotas, or attempt to obtain another user&apos;s data. We may suspend access that creates security, reliability, or legal risk.</p></section><section><h2>Verification outcomes</h2><p>A verification report describes the result of a specified test suite for an agent version at a point in time. It is not a guarantee of future behavior, legal compliance, security certification, or fitness for every use case.</p></section><section><h2>Governing terms</h2><p>These terms are governed by the laws of India, subject to applicable consumer-protection requirements. Contact support before using a paid plan if you have a billing concern.</p></section></LegalPage>;
}
