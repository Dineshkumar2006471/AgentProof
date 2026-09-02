import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import { awsRegion, requireEnv } from "@/lib/env";

let cognitoClient: CognitoIdentityProviderClient | undefined;

function getCognitoClient() {
  cognitoClient ??= new CognitoIdentityProviderClient({ region: awsRegion() });
  return cognitoClient;
}

export async function countRegisteredUsers() {
  let total = 0;
  let paginationToken: string | undefined;
  do {
    const result = await getCognitoClient().send(new ListUsersCommand({
      UserPoolId: requireEnv("COGNITO_USER_POOL_ID"),
      PaginationToken: paginationToken,
      Limit: 60
    }));
    total += result.Users?.length ?? 0;
    paginationToken = result.PaginationToken;
  } while (paginationToken);
  return total;
}
