import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Refunds and Cancellations", description: "AgentProof subscription cancellation and refund handling.", alternates: { canonical: "/refunds" } };

export default function RefundsPage() {
  return <LegalPage title="Refunds and Cancellations" updatedAt="02 September 2026"><section><h2>Subscriptions</h2><p>You may cancel a recurring Builder or Agency subscription before its next renewal. Access remains available through the paid period unless a payment is reversed, fraudulent, or required to be suspended for security reasons.</p></section><section><h2>One-time verification runs</h2><p>One-time verification capacity is consumed when a verification run begins. Unused paid capacity may be reviewed for a refund where required by applicable law or where a provider-side technical issue prevented delivery.</p></section><section><h2>Requesting help</h2><p>Contact support@agent-proof.dev with the payment email, purchase date, and a concise explanation. Do not send card numbers, passwords, or endpoint credentials. Dodo Payments may require additional payment information through its secure channel.</p></section></LegalPage>;
}
