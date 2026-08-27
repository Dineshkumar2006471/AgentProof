import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class UpstreamServiceError extends Error {
  constructor(message: string, public readonly service: string) {
    super(message);
    this.name = "UpstreamServiceError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ConflictError) {
    return jsonError(error.message, 409);
  }

  if (error instanceof UpstreamServiceError) {
    return jsonError(error.message, 502);
  }

  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request.", 422);
  }

  if (error instanceof Error) {
    const errorName = error.name;
    if (errorName === "SyntaxError") {
      return jsonError("Invalid JSON request.", 400);
    }
    if (["CredentialsProviderError", "ExpiredTokenException", "UnrecognizedClientException", "InvalidClientTokenId"].includes(errorName)) {
      return jsonError("AWS authentication is unavailable. Re-authenticate the development SSO session.", 503);
    }
    if (["NotAuthorizedException", "UserNotFoundException", "AccessDeniedException"].includes(errorName)) {
      return jsonError("Authentication failed.", 401);
    }
    if (errorName === "UserNotConfirmedException") {
      return jsonError("Confirm your email address before signing in.", 422);
    }
    if (errorName === "PasswordResetRequiredException") {
      return jsonError("Reset your password before signing in.", 422);
    }
    if (["UsernameExistsException", "CodeMismatchException", "InvalidPasswordException", "InvalidParameterException"].includes(errorName)) {
      return jsonError("The authentication request could not be completed.", 422);
    }
    if (["LimitExceededException", "TooManyRequestsException"].includes(errorName)) {
      return jsonError("Too many authentication attempts. Try again later.", 429);
    }
    if (errorName === "ResourceNotFoundException") {
      return jsonError("Authentication is not configured correctly. Check the Cognito environment settings.", 503);
    }
    console.error(error);
    return jsonError("Internal server error.", 500);
  }

  return jsonError("Unexpected server error.", 500);
}
