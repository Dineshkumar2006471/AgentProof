import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand as DocumentQueryCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { awsRegion, requireEnv } from "@/lib/env";
import type {
  Agent,
  AgentContract,
  Evidence,
  ReliabilityScore,
  TestRun,
  VerificationRun,
  VerificationStatusRecord,
  VerificationTest
} from "@/lib/domain";
import { createEndpointSecret } from "@/lib/aws/secrets";
import type { EndpointAuthType } from "@/lib/endpoint-auth";
import type { BillingAccount, PricingPlanId } from "@/lib/pricing";

let documentClient: DynamoDBDocumentClient | undefined;

export function getDynamoDb() {
  if (!documentClient) {
    documentClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region: awsRegion() })
    );
  }
  return documentClient;
}

const tableName = () => requireEnv("AGENTPROOF_DYNAMODB_TABLE");
const now = () => new Date().toISOString();

export async function createAgent(input: {
  ownerId: string;
  name: string;
  endpointUrl: string;
  version: string;
  endpointAuthType?: EndpointAuthType;
  endpointAuthToken?: string;
  endpointAuthUsername?: string;
  endpointAuthHeaderName?: string;
}) {
  const id = `agent_${crypto.randomUUID()}`;
  const createdAt = now();
  const endpointAuthType = input.endpointAuthType ?? "none";
  let endpointSecretArn: string | undefined;
  if (endpointAuthType !== "none") {
    if (!input.endpointAuthToken) throw new Error("An endpoint credential is required for authenticated endpoints.");
    if (endpointAuthType === "basic" && !input.endpointAuthUsername) throw new Error("A Basic authentication username is required.");
    const endpointSecret = endpointAuthType === "basic"
      ? JSON.stringify({ username: input.endpointAuthUsername, password: input.endpointAuthToken })
      : input.endpointAuthToken;
    endpointSecretArn = await createEndpointSecret(id, endpointSecret);
  }
  const item: Agent & Record<string, unknown> = {
    PK: `AGENT#${id}`,
    SK: "META",
    entityType: "Agent",
    id,
    ownerId: input.ownerId,
    name: input.name,
    endpointUrl: input.endpointUrl,
    endpointAuthType,
    ...(endpointAuthType === "api_key" && input.endpointAuthHeaderName ? { endpointAuthHeaderName: input.endpointAuthHeaderName } : {}),
    ...(endpointSecretArn ? { endpointSecretArn } : {}),
    currentVersion: input.version,
    createdAt,
    GSI1PK: `OWNER#${input.ownerId}`,
    GSI1SK: `AGENT#${createdAt}#${id}`
  };

  await getDynamoDb().send(new PutCommand({
    TableName: tableName(),
    Item: item,
    ConditionExpression: "attribute_not_exists(PK)"
  }));
  return item;
}

export async function listAgentsByOwner(ownerId: string) {
  const result = await getDynamoDb().send(new DocumentQueryCommand({
    TableName: tableName(),
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1PK = :pk AND begins_with(GSI1SK, :sk)",
    ExpressionAttributeValues: { ":pk": `OWNER#${ownerId}`, ":sk": "AGENT#" },
    ScanIndexForward: false
  }));
  return (result.Items ?? []) as Array<Agent & Record<string, unknown>>;
}

export async function getBillingAccount(ownerId: string) {
  const result = await getDynamoDb().send(new GetCommand({
    TableName: tableName(),
    Key: { PK: `USER#${ownerId}`, SK: "BILLING#ACCOUNT" }
  }));
  return (result.Item ?? null) as BillingAccount | null;
}

export async function recordPolicyAcceptance(ownerId: string, input: { version: string; acceptedAt: string }) {
  await getDynamoDb().send(new PutCommand({
    TableName: tableName(),
    Item: {
      PK: `USER#${ownerId}`,
      SK: "POLICY#TERMS",
      entityType: "PolicyAcceptance",
      policyVersion: input.version,
      acceptedAt: input.acceptedAt
    }
  }));
}

export async function consumeRateLimit(input: { scope: string; subject: string; limit: number; windowSeconds: number }) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSeconds / input.windowSeconds) * input.windowSeconds;
  try {
    await getDynamoDb().send(new UpdateCommand({
      TableName: tableName(),
      Key: { PK: `RATE#${input.scope}#${input.subject}`, SK: `WINDOW#${windowStart}` },
      UpdateExpression: "SET #count = if_not_exists(#count, :zero) + :one, #expiresAt = :expiresAt, #entityType = :entityType",
      ConditionExpression: "attribute_not_exists(#count) OR #count < :limit",
      ExpressionAttributeNames: { "#count": "count", "#expiresAt": "expiresAt", "#entityType": "entityType" },
      ExpressionAttributeValues: { ":zero": 0, ":one": 1, ":limit": input.limit, ":expiresAt": windowStart + input.windowSeconds * 2, ":entityType": "RateLimit" }
    }));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") return false;
    throw error;
  }
}

export type FounderMetrics = {
  agents: number;
  verificationRuns: number;
  completedRuns: number;
  activeBuilderSubscriptions: number;
  activeAgencySubscriptions: number;
  oneTimePurchases: number;
  failedPayments: number;
};

export async function getFounderMetrics(): Promise<FounderMetrics> {
  const metrics: FounderMetrics = { agents: 0, verificationRuns: 0, completedRuns: 0, activeBuilderSubscriptions: 0, activeAgencySubscriptions: 0, oneTimePurchases: 0, failedPayments: 0 };
  let exclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await getDynamoDb().send(new ScanCommand({
      TableName: tableName(),
      ProjectionExpression: "#entityType, #status, #plan, #billingStatus, #eventType",
      ExpressionAttributeNames: { "#entityType": "entityType", "#status": "status", "#plan": "plan", "#billingStatus": "billingStatus", "#eventType": "eventType" },
      ExclusiveStartKey: exclusiveStartKey
    }));
    for (const item of result.Items ?? []) {
      const entityType = item.entityType;
      if (entityType === "Agent") metrics.agents += 1;
      if (entityType === "VerificationRun") {
        metrics.verificationRuns += 1;
        if (item.status === "COMPLETED") metrics.completedRuns += 1;
      }
      if (entityType === "BillingAccount" && item.billingStatus === "active") {
        if (item.plan === "builder") metrics.activeBuilderSubscriptions += 1;
        if (item.plan === "agency") metrics.activeAgencySubscriptions += 1;
      }
      if (entityType === "DodoWebhook") {
        if (item.eventType === "payment.succeeded" && item.plan === "pay_per_verification") metrics.oneTimePurchases += 1;
        if (item.eventType === "payment.failed") metrics.failedPayments += 1;
      }
    }
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);
  return metrics;
}

export async function getAgent(id: string) {
  const result = await getDynamoDb().send(new GetCommand({
    TableName: tableName(),
    Key: { PK: `AGENT#${id}`, SK: "META" }
  }));
  return (result.Item ?? null) as (Agent & Record<string, unknown>) | null;
}

export async function getAgentForOwner(id: string, ownerId: string) {
  const agent = await getAgent(id);
  return agent?.ownerId === ownerId ? agent : null;
}

export async function createContractVersion(input: Omit<AgentContract, "id" | "createdAt">) {
  const item = {
    PK: `AGENT#${input.agentId}`,
    SK: `CONTRACT#${input.version}`,
    entityType: "AgentContract",
    id: `contract_${crypto.randomUUID()}`,
    ...input,
    createdAt: now()
  };
  await getDynamoDb().send(new PutCommand({
    TableName: tableName(),
    Item: item,
    ConditionExpression: "attribute_not_exists(PK)"
  }));
  return item as AgentContract & Record<string, unknown>;
}

export async function getContract(agentId: string, version: string) {
  const result = await getDynamoDb().send(new GetCommand({
    TableName: tableName(),
    Key: { PK: `AGENT#${agentId}`, SK: `CONTRACT#${version}` }
  }));
  return (result.Item ?? null) as (AgentContract & Record<string, unknown>) | null;
}

export async function getContractById(agentId: string, contractId: string) {
  const result = await getDynamoDb().send(new DocumentQueryCommand({
    TableName: tableName(),
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    FilterExpression: "id = :id",
    ExpressionAttributeValues: { ":pk": `AGENT#${agentId}`, ":sk": "CONTRACT#", ":id": contractId },
    Limit: 100
  }));
  return (result.Items?.[0] ?? null) as (AgentContract & Record<string, unknown>) | null;
}

export async function getLatestContract(agentId: string) {
  const result = await getDynamoDb().send(new DocumentQueryCommand({
    TableName: tableName(),
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: { ":pk": `AGENT#${agentId}`, ":sk": "CONTRACT#" },
    ScanIndexForward: false,
    Limit: 1
  }));
  return (result.Items?.[0] ?? null) as (AgentContract & Record<string, unknown>) | null;
}

export async function saveTests(agentId: string, tests: VerificationTest[]) {
  if (tests.length > 100) throw new Error("A test suite cannot exceed 100 tests per write.");
  await getDynamoDb().send(new TransactWriteCommand({
    TransactItems: tests.map((test) => ({
      Put: {
        TableName: tableName(),
        Item: {
          PK: `AGENT#${agentId}`,
          SK: `TEST#${test.id}`,
          entityType: "VerificationTest",
          ...test
        },
        ConditionExpression: "attribute_not_exists(PK)"
      }
    }))
  }));
  return tests;
}

export async function listTests(agentId: string, contractId?: string) {
  const result = await getDynamoDb().send(new DocumentQueryCommand({
    TableName: tableName(),
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
    ExpressionAttributeValues: { ":pk": `AGENT#${agentId}`, ":sk": "TEST#" }
  }));
  const tests = (result.Items ?? []) as VerificationTest[];
  return contractId ? tests.filter((test) => test.contractId === contractId) : tests;
}

export type RunUsageReservation = {
  ownerId: string;
  monthlyTestLimit?: number;
  monthlyRunLimit?: number;
  consumeOneRunCredit?: boolean;
};

function currentUsageMonth(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export async function createVerificationRun(input: Omit<VerificationRun, "id">, reservation?: RunUsageReservation) {
  const id = `run_${crypto.randomUUID()}`;
  const item = {
    PK: `RUN#${id}`,
    SK: "META",
    entityType: "VerificationRun",
    id,
    ...input,
    GSI3PK: `AGENT#${input.agentId}`,
    GSI3SK: `RUN#${input.startedAt}`
  };
  const transactItems: Array<Record<string, unknown>> = [{
    Put: {
      TableName: tableName(),
      Item: item,
      ConditionExpression: "attribute_not_exists(PK)"
    }
  }];

  if (reservation?.consumeOneRunCredit) {
    transactItems.push({
      Update: {
        TableName: tableName(),
        Key: { PK: `USER#${reservation.ownerId}`, SK: "BILLING#ACCOUNT" },
        UpdateExpression: "SET #updatedAt = :updatedAt ADD #credits :decrement",
        ConditionExpression: "#credits >= :minimum",
        ExpressionAttributeNames: { "#credits": "oneRunCredits", "#updatedAt": "updatedAt" },
        ExpressionAttributeValues: { ":decrement": -1, ":minimum": 1, ":updatedAt": now() }
      }
    });
  }

  if (reservation?.monthlyTestLimit !== undefined) {
    const testCount = input.totalTests;
    const testLimit = reservation.monthlyTestLimit;
    transactItems.push({
      Update: {
        TableName: tableName(),
        Key: { PK: `USER#${reservation.ownerId}`, SK: `USAGE#TESTS#${currentUsageMonth()}` },
        UpdateExpression: "SET #entityType = :entityType, #updatedAt = :updatedAt ADD #tests :testCount",
        ConditionExpression: "(attribute_not_exists(#tests) AND :testCount <= :testLimit) OR #tests <= :remaining",
        ExpressionAttributeNames: { "#entityType": "entityType", "#updatedAt": "updatedAt", "#tests": "testsUsed" },
        ExpressionAttributeValues: {
          ":entityType": "MonthlyTestUsage",
          ":updatedAt": now(),
          ":testCount": testCount,
          ":testLimit": testLimit,
          ":remaining": testLimit - testCount
        }
      }
    });
  }

  if (reservation?.monthlyRunLimit !== undefined) {
    const runLimit = reservation.monthlyRunLimit;
    transactItems.push({
      Update: {
        TableName: tableName(),
        Key: { PK: `USER#${reservation.ownerId}`, SK: `USAGE#RUNS#${currentUsageMonth()}` },
        UpdateExpression: "SET #entityType = :entityType, #updatedAt = :updatedAt ADD #runs :runCount",
        ConditionExpression: "(attribute_not_exists(#runs) AND :runCount <= :runLimit) OR #runs <= :remaining",
        ExpressionAttributeNames: { "#entityType": "entityType", "#updatedAt": "updatedAt", "#runs": "runsUsed" },
        ExpressionAttributeValues: {
          ":entityType": "MonthlyRunUsage",
          ":updatedAt": now(),
          ":runCount": 1,
          ":runLimit": runLimit,
          ":remaining": runLimit - 1
        }
      }
    });
  }

  await getDynamoDb().send(new TransactWriteCommand({ TransactItems: transactItems }));
  return item as VerificationRun & Record<string, unknown>;
}

export async function releaseVerificationRunReservation(totalTests: number, reservation: RunUsageReservation) {
  const transactItems: Array<Record<string, unknown>> = [];

  if (reservation.consumeOneRunCredit) {
    transactItems.push({
      Update: {
        TableName: tableName(),
        Key: { PK: `USER#${reservation.ownerId}`, SK: "BILLING#ACCOUNT" },
        UpdateExpression: "SET #updatedAt = :updatedAt ADD #credits :increment",
        ExpressionAttributeNames: { "#credits": "oneRunCredits", "#updatedAt": "updatedAt" },
        ExpressionAttributeValues: { ":increment": 1, ":updatedAt": now() }
      }
    });
  }

  if (reservation.monthlyTestLimit !== undefined) {
    transactItems.push({
      Update: {
        TableName: tableName(),
        Key: { PK: `USER#${reservation.ownerId}`, SK: `USAGE#TESTS#${currentUsageMonth()}` },
        UpdateExpression: "SET #updatedAt = :updatedAt ADD #tests :refund",
        ConditionExpression: "#tests >= :minimum",
        ExpressionAttributeNames: { "#updatedAt": "updatedAt", "#tests": "testsUsed" },
        ExpressionAttributeValues: { ":updatedAt": now(), ":refund": -totalTests, ":minimum": totalTests }
      }
    });
  }

  if (reservation.monthlyRunLimit !== undefined) {
    transactItems.push({
      Update: {
        TableName: tableName(),
        Key: { PK: `USER#${reservation.ownerId}`, SK: `USAGE#RUNS#${currentUsageMonth()}` },
        UpdateExpression: "SET #updatedAt = :updatedAt ADD #runs :refund",
        ConditionExpression: "#runs >= :minimum",
        ExpressionAttributeNames: { "#updatedAt": "updatedAt", "#runs": "runsUsed" },
        ExpressionAttributeValues: { ":updatedAt": now(), ":refund": -1, ":minimum": 1 }
      }
    });
  }

  if (transactItems.length) await getDynamoDb().send(new TransactWriteCommand({ TransactItems: transactItems }));
}

export async function getRun(id: string) {
  const result = await getDynamoDb().send(new GetCommand({
    TableName: tableName(),
    Key: { PK: `RUN#${id}`, SK: "META" }
  }));
  return (result.Item ?? null) as (VerificationRun & Record<string, unknown>) | null;
}

export async function getRunForOwner(id: string, ownerId: string) {
  const run = await getRun(id);
  return run?.ownerId === ownerId ? run : null;
}

export async function getRunRecords(id: string) {
  const result = await getDynamoDb().send(new DocumentQueryCommand({
    TableName: tableName(),
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: { ":pk": `RUN#${id}` }
  }));
  return result.Items ?? [];
}

export async function getVerificationStatus(runId: string) {
  const result = await getDynamoDb().send(new GetCommand({
    TableName: tableName(),
    Key: { PK: `RUN#${runId}`, SK: "STATUS" }
  }));
  return (result.Item ?? null) as VerificationStatusRecord | null;
}

export async function getReliabilityScore(runId: string) {
  const result = await getDynamoDb().send(new GetCommand({
    TableName: tableName(),
    Key: { PK: `RUN#${runId}`, SK: "SCORE" }
  }));
  return (result.Item ?? null) as (ReliabilityScore & { verificationRunId: string }) | null;
}

export async function listRunsByAgent(agentId: string, limit = 20) {
  const result = await getDynamoDb().send(new DocumentQueryCommand({
    TableName: tableName(),
    IndexName: "GSI3",
    KeyConditionExpression: "GSI3PK = :pk AND begins_with(GSI3SK, :sk)",
    ExpressionAttributeValues: { ":pk": `AGENT#${agentId}`, ":sk": "RUN#" },
    ScanIndexForward: false,
    Limit: limit
  }));
  return (result.Items ?? []) as Array<VerificationRun & Record<string, unknown>>;
}

export async function getLatestAgentVerification(agentId: string) {
  const runs = await listRunsByAgent(agentId, 1);
  const run = runs[0];
  if (!run) return null;
  return { run, status: await getVerificationStatus(run.id), score: await getReliabilityScore(run.id) };
}

export async function updateRun(input: Partial<VerificationRun> & { id: string }) {
  const entries = Object.entries(input).filter(([key]) => key !== "id");
  if (!entries.length) return getRun(input.id);
  const names: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  const assignments = entries.map(([key, value], index) => {
    const name = `#n${index}`;
    const valueName = `:v${index}`;
    names[name] = key;
    values[valueName] = value;
    return `${name} = ${valueName}`;
  });
  const result = await getDynamoDb().send(new UpdateCommand({
    TableName: tableName(),
    Key: { PK: `RUN#${input.id}`, SK: "META" },
    UpdateExpression: `SET ${assignments.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: "ALL_NEW"
  }));
  return result.Attributes ?? null;
}

export async function claimVerificationRun(id: string) {
  try {
    await getDynamoDb().send(new UpdateCommand({
      TableName: tableName(),
      Key: { PK: `RUN#${id}`, SK: "META" },
      UpdateExpression: "SET #status = :running, workerStartedAt = :startedAt",
      ConditionExpression: "#status = :queued",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":running": "RUNNING", ":queued": "QUEUED", ":startedAt": now() }
    }));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") return false;
    throw error;
  }
}

export async function saveTestRun(testRun: TestRun) {
  await getDynamoDb().send(new PutCommand({
    TableName: tableName(),
    Item: { PK: `RUN#${testRun.verificationRunId}`, SK: `TESTRUN#${testRun.id}`, entityType: "TestRun", ...testRun }
  }));
}

export async function saveEvidence(evidence: Evidence) {
  if (!evidence.verificationRunId) throw new Error("Evidence must include its verification run ID.");
  await getDynamoDb().send(new PutCommand({
    TableName: tableName(),
    Item: { PK: `RUN#${evidence.verificationRunId}`, SK: `EVIDENCE#${evidence.id}`, entityType: "Evidence", ...evidence }
  }));
}

export async function saveScore(runId: string, score: ReliabilityScore) {
  await getDynamoDb().send(new PutCommand({
    TableName: tableName(),
    Item: { PK: `RUN#${runId}`, SK: "SCORE", entityType: "ReliabilityScore", id: `score_${runId}`, verificationRunId: runId, ...score, computedAt: now() }
  }));
}

export async function saveVerificationStatus(status: VerificationStatusRecord) {
  await getDynamoDb().send(new PutCommand({
    TableName: tableName(),
    Item: {
      PK: `RUN#${status.verificationRunId}`,
      SK: "STATUS",
      entityType: "VerificationStatus",
      GSI2PK: `PUBLIC#${status.publicId}`,
      GSI2SK: `REPORT#${status.issuedAt}`,
      ...status
    }
  }));
}

export async function getPublicReport(publicId: string) {
  const result = await getDynamoDb().send(new DocumentQueryCommand({
    TableName: tableName(),
    IndexName: "GSI2",
    KeyConditionExpression: "GSI2PK = :pk",
    ExpressionAttributeValues: { ":pk": `PUBLIC#${publicId}` },
    Limit: 1
  }));
  return (result.Items?.[0] ?? null) as VerificationStatusRecord | null;
}

type DodoWebhookEvent = {
  type: string;
  data?: unknown;
};

function objectValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function planFromProductId(productId: string | undefined): Exclude<PricingPlanId, "free"> | undefined {
  if (!productId) return undefined;
  const productPlans = [
    [process.env.DODO_BUILDER_PRODUCT_ID, "builder"],
    [process.env.DODO_AGENCY_PRODUCT_ID, "agency"],
    [process.env.DODO_ONE_RUN_PRODUCT_ID, "pay_per_verification"]
  ] as const;
  return productPlans.find(([configuredProductId]) => configuredProductId === productId)?.[1];
}

function eventDetails(event: DodoWebhookEvent) {
  const data = objectValue(event.data);
  const metadata = objectValue(data.metadata);
  const customer = objectValue(data.customer);
  const productCart = Array.isArray(data.product_cart) ? data.product_cart : [];
  const firstProduct = objectValue(productCart[0]);
  const productId = stringValue(data.product_id) ?? stringValue(firstProduct.product_id);
  const metadataPlan = stringValue(metadata.plan);
  const plan = metadataPlan === "builder" || metadataPlan === "agency" || metadataPlan === "pay_per_verification"
    ? metadataPlan
    : planFromProductId(productId);

  return {
    data,
    ownerId: stringValue(metadata.agentproofUserId),
    plan,
    customerId: stringValue(customer.customer_id) ?? stringValue(data.customer_id),
    subscriptionId: stringValue(data.subscription_id),
    paymentId: stringValue(data.payment_id),
    status: stringValue(data.status)
  };
}

export async function applyDodoWebhook(webhookId: string, event: DodoWebhookEvent) {
  const details = eventDetails(event);
  const ownerId = details.ownerId;
  const timestamp = now();
  const webhookItem = {
    PK: ownerId ? `USER#${ownerId}` : "DODO#UNMATCHED",
    SK: `WEBHOOK#${webhookId}`,
    entityType: "DodoWebhook",
    webhookId,
    eventType: event.type,
    ownerId,
    receivedAt: timestamp,
    paymentId: details.paymentId,
    subscriptionId: details.subscriptionId,
    plan: details.plan
  };

  const subscriptionEvents = new Set(["subscription.active", "subscription.renewed", "subscription.updated", "subscription.plan_changed"]);
  const inactiveEvents = new Set(["subscription.cancelled", "subscription.expired", "subscription.failed", "subscription.on_hold"]);
  const isOneRun = event.type === "payment.succeeded" && details.plan === "pay_per_verification";
  const billingStatus = subscriptionEvents.has(event.type)
    ? "active"
    : inactiveEvents.has(event.type)
      ? event.type.replace("subscription.", "")
      : event.type === "payment.succeeded" ? "paid" : event.type;

  const transactItems: Array<Record<string, unknown>> = [{
    Put: {
      TableName: tableName(),
      Item: webhookItem,
      ConditionExpression: "attribute_not_exists(PK)"
    }
  }];

  if (ownerId) {
    const planAssignment = details.plan ? "#plan = :plan" : "#plan = if_not_exists(#plan, :freePlan)";
    const billingValues: Record<string, unknown> = {
      ":entityType": "BillingAccount",
      ":updatedAt": timestamp,
      ":status": billingStatus,
      ":customerId": details.customerId ?? "",
      ":subscriptionId": details.subscriptionId ?? "",
      ":oneRunCredits": isOneRun ? 1 : 0,
      ...(details.plan ? { ":plan": details.plan } : { ":freePlan": "free" })
    };
    transactItems.push({
      Update: {
        TableName: tableName(),
        Key: { PK: `USER#${ownerId}`, SK: "BILLING#ACCOUNT" },
        UpdateExpression: `SET #entityType = :entityType, #updatedAt = :updatedAt, #status = :status, ${planAssignment}, #customerId = if_not_exists(#customerId, :customerId), #subscriptionId = if_not_exists(#subscriptionId, :subscriptionId) ADD #oneRunCredits :oneRunCredits`,
        ExpressionAttributeNames: {
          "#entityType": "entityType",
          "#updatedAt": "updatedAt",
          "#status": "billingStatus",
          "#plan": "plan",
          "#customerId": "dodoCustomerId",
          "#subscriptionId": "dodoSubscriptionId",
          "#oneRunCredits": "oneRunCredits"
        },
        ExpressionAttributeValues: billingValues
      }
    });
  }

  try {
    await getDynamoDb().send(new TransactWriteCommand({ TransactItems: transactItems }));
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "TransactionCanceledException") return false;
    throw error;
  }
}
