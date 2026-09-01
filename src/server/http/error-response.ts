import { NextResponse } from "next/server";
import { ForbiddenError, UnauthenticatedError } from "@/server/auth/auth.errors";

type ErrorPayload = {
  message: string;
  code: string;
  details?: unknown;
};

function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : "UnknownError";
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error interno del servidor";
}

function getErrorDetails(error: unknown): unknown {
  if (typeof error === "object" && error !== null && "details" in error) {
    return (error as { details?: unknown }).details;
  }
  return undefined;
}

function getExplicitStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const value = (error as { status?: unknown }).status;
    if (typeof value === "number" && value >= 400 && value < 600) {
      return value;
    }
  }
  return undefined;
}

function mapStatus(error: unknown): number {
  if (error instanceof UnauthenticatedError) return 401;
  if (error instanceof ForbiddenError) return 403;

  // Errores que declaran su propio HTTP status (ej. BoldGatewayError: 502/504).
  const explicit = getExplicitStatus(error);
  if (explicit !== undefined) return explicit;

  const name = getErrorName(error);
  if (name.endsWith("ValidationError")) return 400;
  if (name.endsWith("UnauthorizedError") || name.endsWith("ForbiddenError")) return 403;
  if (name.endsWith("NotFoundError")) return 404;
  if (name.endsWith("ConflictError")) return 409;

  return 500;
}

function mapCode(error: unknown): string {
  const name = getErrorName(error);
  return name
    .replace(/Error$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toUpperCase();
}

export function toErrorResponse(error: unknown): NextResponse<ErrorPayload> {
  const status = mapStatus(error);
  const payload: ErrorPayload = {
    message: getErrorMessage(error),
    code: mapCode(error),
  };

  const details = getErrorDetails(error);
  if (details !== undefined) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
}
