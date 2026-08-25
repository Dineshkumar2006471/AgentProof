import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { requireEnv } from "@/lib/env";

let client: CognitoIdentityProviderClient | undefined;

function getClient() {
  client ??= new CognitoIdentityProviderClient({ region: requireEnv("AWS_REGION") });
  return client;
}

function clientId() {
  return requireEnv("COGNITO_CLIENT_ID");
}

export async function signUp(input: { email: string; password: string; name: string }) {
  return getClient().send(new SignUpCommand({
    ClientId: clientId(),
    Username: input.email,
    Password: input.password,
    UserAttributes: [
      { Name: "email", Value: input.email },
      { Name: "name", Value: input.name }
    ]
  }));
}

export async function confirmSignUp(email: string, code: string) {
  return getClient().send(new ConfirmSignUpCommand({
    ClientId: clientId(),
    Username: email,
    ConfirmationCode: code
  }));
}

export async function signIn(email: string, password: string) {
  const result = await getClient().send(new InitiateAuthCommand({
    ClientId: clientId(),
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: { USERNAME: email, PASSWORD: password }
  }));

  if (!result.AuthenticationResult?.AccessToken) {
    throw new Error("Cognito requires an additional authentication challenge.");
  }

  return result.AuthenticationResult;
}

export async function refreshSession(refreshToken: string) {
  const result = await getClient().send(new InitiateAuthCommand({
    ClientId: clientId(),
    AuthFlow: "REFRESH_TOKEN_AUTH",
    AuthParameters: { REFRESH_TOKEN: refreshToken }
  }));
  return result.AuthenticationResult;
}

export async function signOut(accessToken: string) {
  await getClient().send(new GlobalSignOutCommand({ AccessToken: accessToken }));
}

export async function forgotPassword(email: string) {
  return getClient().send(new ForgotPasswordCommand({
    ClientId: clientId(),
    Username: email
  }));
}

export async function confirmForgotPassword(email: string, code: string, password: string) {
  return getClient().send(new ConfirmForgotPasswordCommand({
    ClientId: clientId(),
    Username: email,
    ConfirmationCode: code,
    Password: password
  }));
}
