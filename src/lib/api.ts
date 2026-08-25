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
    if (["NotAuthorizedException", "UserNotFoundException", "AccessDeniedException"].includes(errorName)) {
      return jsonError("Authentication failed.", 401);
    }
    if (["UsernameExistsException", "CodeMismatchException", "InvalidPasswordException", "LimitExceededException"].includes(errorName)) {
      return jsonError("The authentication request could not be completed.", 422);
    }
    console.error(error);
    return jsonError("Internal server error.", 500);
  }

  return jsonError("Unexpected server error.", 500);
}
