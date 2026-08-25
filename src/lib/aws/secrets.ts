import {
  CreateSecretCommand,
  GetSecretValueCommand,
  SecretsManagerClient
} from "@aws-sdk/client-secrets-manager";
import { requireEnv } from "@/lib/env";

let client: SecretsManagerClient | undefined;

function getClient() {
  client ??= new SecretsManagerClient({ region: requireEnv("AWS_REGION") });
  return client;
}

function environmentName() {
  return process.env.AGENTPROOF_ENVIRONMENT ?? "development";
}

export async function createEndpointSecret(agentId: string, token: string) {
  const result = await getClient().send(new CreateSecretCommand({
    Name: `agentproof/agents/${environmentName()}/${agentId}`,
    Description: `AgentProof endpoint credential for ${agentId}`,
    SecretString: token,
    Tags: [{ Key: "application", Value: "agentproof" }, { Key: "purpose", Value: "endpoint-credential" }]
  }));
  if (!result.ARN) throw new Error("Endpoint credential secret was created without an ARN.");
  return result.ARN;
}

export async function getSecretString(secretArn: string) {
  const result = await getClient().send(new GetSecretValueCommand({ SecretId: secretArn }));
  if (!result.SecretString) throw new Error("Endpoint credential secret is empty.");
  return result.SecretString;
}
