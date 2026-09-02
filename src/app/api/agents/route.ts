import { createAgentSchema } from "@/lib/validation";
import { ApiError, handleApiError, jsonOk } from "@/lib/api";
import { createAgent, getBillingAccount, listAgentsByOwner } from "@/lib/aws/dynamodb";
import { requireUser } from "@/lib/auth/require-user";
import { entitlementForPlan, getPricingPlan, resolveEntitledPlan } from "@/lib/pricing";

export async function GET() {
  try {
    const user = await requireUser();
    return jsonOk({ agents: await listAgentsByOwner(user.sub) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createAgentSchema.parse(await request.json());
    const user = await requireUser();
    const [existingAgents, billingAccount] = await Promise.all([
      listAgentsByOwner(user.sub),
      getBillingAccount(user.sub)
    ]);
    const planId = resolveEntitledPlan(billingAccount);
    const { maxAgents } = entitlementForPlan(planId);
    if (existingAgents.length >= maxAgents) {
      const planName = getPricingPlan(planId)?.name ?? "current";
      throw new ApiError(
        429,
        `${planName} plan limit reached. This account can register up to ${maxAgents} agents. Choose a higher plan to add more agents.`
      );
    }

    const agent = await createAgent({
      ownerId: user.sub,
      name: input.name,
      endpointUrl: input.endpointUrl,
      version: input.version,
      endpointAuthType: input.endpointAuthType,
      endpointAuthToken: input.endpointAuthToken,
      endpointAuthUsername: input.endpointAuthUsername,
      endpointAuthHeaderName: input.endpointAuthHeaderName
    });
    return jsonOk({ agent }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
