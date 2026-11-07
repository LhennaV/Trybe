import "server-only";
import * as Sentry from "@sentry/nextjs";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import {
  ERROR_MESSAGES,
  ERROR_STATUS,
  isErrorCode,
  type ApiError,
  type ApiSuccess,
  type ErrorCode,
} from "@/shared/contracts/common";
import { findPgError } from "@/server/db/pgError";
import { AppError } from "@/server/errors";

export function ok<T>(data: T, status = 200) {
  return Response.json({ data } satisfies ApiSuccess<T>, { status });
}

export function fail(code: ErrorCode, message: string = ERROR_MESSAGES[code], fields?: Record<string, string[]>) {
  const body: ApiError = { error: { code, message, ...(fields && { fields }) } };
  return Response.json(body, { status: ERROR_STATUS[code] });
}

function zodFields(error: z.ZodError) {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

// Maps anything thrown by server code to the standard error response.
export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) return fail(error.code, error.message, error.fields);

  if (error instanceof z.ZodError) return fail("VALIDATION_FAILED", undefined, zodFields(error));

  const pg = findPgError(error);
  if (pg) {
    // Database functions raise their stable code as the message (docs/database.md 5.3).
    if (pg.code === "P0001" && isErrorCode(pg.message)) return fail(pg.message);
    // Deadlock or serialization failure: the trade changed under us, client may retry.
    if (pg.code === "40P01" || pg.code === "40001") return fail("CONFLICT");
  }

  // Unexpected. Never leak details to the client. handleRoute catches the
  // error, so Next's onRequestError never sees it; report it here instead.
  console.error(error);
  Sentry.captureException(error);
  return fail("INTERNAL_ERROR");
}

// Wraps a route handler so anything it throws becomes a standard error response.
//   export const POST = handleRoute(async (request, ctx: RouteContext<"/api/trades/[id]/accept">) => ...)
export function handleRoute<Ctx = unknown>(handler: (request: Request, ctx: Ctx) => Promise<Response>) {
  return async (request: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await handler(request, ctx);
    } catch (error) {
      // Let Next's own control-flow errors through (redirect, notFound, and the
      // signal `connection()` uses to stop a build-time prerender). Catching
      // them would turn them into fake 500s and send them to Sentry.
      unstable_rethrow(error);
      return toErrorResponse(error);
    }
  };
}
