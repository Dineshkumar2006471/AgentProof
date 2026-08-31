import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { applyDodoWebhook } from "@/lib/aws/dynamodb";
import { getDodoClient } from "@/lib/dodo";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const webhookId = request.headers.get("webhook-id");
  const webhookSignature = request.headers.get("webhook-signature");
  const webhookTimestamp = request.headers.get("webhook-timestamp");
  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return jsonError("Invalid webhook signature.", 401);
  }

  try {
    const event = getDodoClient().webhooks.unwrap(rawBody, {
      headers: {
        "webhook-id": webhookId,
        "webhook-signature": webhookSignature,
        "webhook-timestamp": webhookTimestamp
      }
    });
    const result = await applyDodoWebhook(webhookId, event);
    return jsonOk({ received: true, duplicate: !result });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("signature")) {
      return jsonError("Invalid webhook signature.", 401);
    }
    return handleApiError(error);
  }
}
