import { startRunSchema } from "@/lib/validation";
import { ApiError, handleApiError, jsonOk } from "@/lib/api";
import { createVerificationRun, getAgentForOwner, getBillingAccount, getContractById, getLatestContract, listRunsByAgent, listTests, releaseVerificationRunReservation, updateRun } from "@/lib/aws/dynamodb";
import { enqueueVerification } from "@/lib/aws/sqs";
import { requireUser } from "@/lib/auth/require-user";
import { countRunsInWindow } from "@/lib/beta";
import { env } from "@/lib/env";
import { entitlementForPlan, resolveEntitledPlan } from "@/lib/pricing";

type RunRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RunRouteContext) {
  try {
    const { id } = await context.params;
    const input = startRunSchema.parse(await request.json().catch(() => ({})));
    const user = await requireUser();
    const agent = await getAgentForOwner(id, user.sub);
    if (!agent) return jsonOk({ error: "Agent not found." }, { status: 404 });
    const contract = input.contractId ? await getContractById(id, input.contractId) : await getLatestContract(id);
    if (!contract) throw new ApiError(422, "Create a contract before starting verification.");
    const tests = await listTests(id, contract.id);
    if (!tests.length) throw new ApiError(422, "Generate a test matrix before starting verification.");
    const billingAccount = await getBillingAccount(user.sub);
    const planId = resolveEntitledPlan(billingAccount);
    const entitlement = entitlementForPlan(planId);
    if (entitlement.monthlyTestLimit !== undefined && tests.length > entitlement.monthlyTestLimit) {
      throw new ApiError(422, `This test matrix has ${tests.length} tests, which exceeds the ${entitlement.monthlyTestLimit}-test monthly allowance for the current plan.`);
    }
    if (env.AGENTPROOF_BETA_MODE === "true") {
      const recentRunCount = countRunsInWindow(
        await listRunsByAgent(id, env.AGENTPROOF_BETA_MAX_RUNS_PER_AGENT_PER_DAY + 1)
      );
      if (recentRunCount >= env.AGENTPROOF_BETA_MAX_RUNS_PER_AGENT_PER_DAY) {
        throw new ApiError(
          429,
          `Open beta limit reached. This agent can run up to ${env.AGENTPROOF_BETA_MAX_RUNS_PER_AGENT_PER_DAY} verifications per 24 hours.`
        );
      }
    }
    const startedAt = new Date().toISOString();
    const reservation = {
      ownerId: user.sub,
      monthlyTestLimit: entitlement.monthlyTestLimit,
      consumeOneRunCredit: entitlement.consumesOneRunCredit
    };
    let run;
    try {
      run = await createVerificationRun({
        agentId: id,
        ownerId: user.sub,
        agentVersion: agent.currentVersion,
        contractVersion: contract.version,
        testSuiteVersion: contract.version,
        status: "QUEUED",
        startedAt,
        totalTests: tests.length,
        passed: 0,
        failed: 0,
        criticalFailed: 0
      }, reservation);
    } catch (error) {
      if (error instanceof Error && error.name === "TransactionCanceledException") {
        throw new ApiError(429, planId === "pay_per_verification"
          ? "No paid one-run credit is available. Purchase another one-run verification to continue."
          : "The current plan does not have enough monthly test capacity for this run.");
      }
      throw error;
    }

    try {
      await enqueueVerification(run.id);
    } catch (error) {
      await releaseVerificationRunReservation(tests.length, reservation).catch((refundError) => console.error("Unable to restore verification capacity", refundError));
      await updateRun({ id: run.id, status: "FAILED", completedAt: new Date().toISOString() });
      throw error;
    }

    return jsonOk({ run, queue: "accepted" }, { status: 202 });
  } catch (error) {
    return handleApiError(error);
  }
}
