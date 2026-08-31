import type { AuthenticationResultType } from "@aws-sdk/client-cognito-identity-provider";
import { awsRegion, requireEnv } from "@/lib/env";

type CognitoErrorBody = {
  __type?: string;
  message?: string;
};

type CognitoAuthResponse = {
  AuthenticationResult?: AuthenticationResultType;
  ChallengeName?: string;
};

type CognitoSignUpResponse = {
  UserSub?: string;
  UserConfirmed?: boolean;
};

function endpoint() {
  return `https://cognito-idp.${awsRegion()}.amazonaws.com/`;
}

async function cognitoRequest<T>(target: string, body: Record<string, unknown>) {
  let response: Response;

  try {
    response = await fetch(endpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": `AWSCognitoIdentityProviderService.${target}`
      },
      body: JSON.stringify(body),
      cache: "no-store"
    });
  } catch {
    const error = new Error("Cognito authentication is temporarily unavailable.");
    error.name = "CognitoServiceError";
    throw error;
  }

  const rawBody = await response.text();
  let parsedBody: T | CognitoErrorBody = {};

  try {
    parsedBody = JSON.parse(rawBody) as T | CognitoErrorBody;
  } catch {
    parsedBody = {};
  }

  if (!response.ok) {
    const errorBody = parsedBody as CognitoErrorBody;
    const error = new Error(errorBody.message ?? "Cognito authentication request failed.");
    error.name = errorBody.__type?.split("#").pop() ?? "CognitoServiceError";
    throw error;
  }

  return parsedBody as T;
}

function clientId() {
  return requireEnv("COGNITO_CLIENT_ID");
}

export async function signUp(input: { email: string; password: string; name: string }) {
  return cognitoRequest<CognitoSignUpResponse>("SignUp", {
    ClientId: clientId(),
    Username: input.email,
    Password: input.password,
    UserAttributes: [
      { Name: "email", Value: input.email },
      { Name: "name", Value: input.name }
    ]
  });
}

export async function confirmSignUp(email: string, code: string) {
  return cognitoRequest("ConfirmSignUp", {
    ClientId: clientId(),
    Username: email,
    ConfirmationCode: code
  });
}

export async function signIn(email: string, password: string) {
  const result = await cognitoRequest<CognitoAuthResponse>("InitiateAuth", {
    ClientId: clientId(),
    AuthFlow: "USER_PASSWORD_AUTH",
    AuthParameters: { USERNAME: email, PASSWORD: password }
  });

  if (!result.AuthenticationResult?.AccessToken) {
    throw new Error("Cognito requires an additional authentication challenge.");
  }

  return result.AuthenticationResult;
}

export async function refreshSession(refreshToken: string) {
  const result = await cognitoRequest<CognitoAuthResponse>("InitiateAuth", {
    ClientId: clientId(),
    AuthFlow: "REFRESH_TOKEN_AUTH",
    AuthParameters: { REFRESH_TOKEN: refreshToken }
  });
  return result.AuthenticationResult;
}

export async function signOut(accessToken: string) {
  await cognitoRequest("GlobalSignOut", { AccessToken: accessToken });
}

export async function forgotPassword(email: string) {
  return cognitoRequest("ForgotPassword", {
    ClientId: clientId(),
    Username: email
  });
}

export async function confirmForgotPassword(email: string, code: string, password: string) {
  return cognitoRequest("ConfirmForgotPassword", {
    ClientId: clientId(),
    Username: email,
    ConfirmationCode: code,
    Password: password
  });
}
