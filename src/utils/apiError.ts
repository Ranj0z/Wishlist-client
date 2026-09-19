import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { SerializedError } from "@reduxjs/toolkit";

type ApiError = FetchBaseQueryError | SerializedError | undefined;

// Backend error bodies are `{ message: string }` on handled failures and
// `{ error: string }` on the 500 catch-all (see auth.controller.ts) — these
// helpers let call sites branch on status and surface whichever is present
// instead of a generic fallback string.

export function hasStatus(error: ApiError, status: number): error is FetchBaseQueryError {
  return !!error && "status" in error && error.status === status;
}

export function getApiErrorMessage(error: ApiError): string | undefined {
  if (!error || !("data" in error)) return undefined;
  const data = error.data;
  if (!data || typeof data !== "object") return undefined;

  const body = data as { message?: unknown; error?: unknown };
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  return undefined;
}
