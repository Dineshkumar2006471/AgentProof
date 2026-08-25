import { jsonOk } from "@/lib/api";

export async function POST() {
  return jsonOk({ received: true, status: "signature_validation_pending" });
}
