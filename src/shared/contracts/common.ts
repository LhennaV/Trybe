// The API's common contract: response shape, error codes, and pagination
// (TRD section 10). Used by the server, the web app, and any future native app.
// Changes here need agreement from both owners.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

// Every error code the API can return, with its HTTP status. `code` is stable,
// so clients branch on it. Add new codes here, never inline.
export const ERROR_STATUS = {
  // 400
  VALIDATION_FAILED: 400,
  CANNOT_TRADE_WITH_SELF: 400,
  // 401
  UNAUTHENTICATED: 401,
  // 403
  FORBIDDEN: 403,
  EMAIL_NOT_VERIFIED: 403,
  NOT_TRADE_MEMBER: 403,
  CANNOT_ACCEPT_OWN_OFFER: 403,
  ITEM_NOT_OWNED: 403,
  // 404
  NOT_FOUND: 404,
  TRADE_NOT_FOUND: 404,
  // 409
  CONFLICT: 409,
  TRADE_NOT_PENDING: 409,
  TRADE_NOT_ACCEPTED: 409,
  ITEM_NOT_AVAILABLE: 409,
  ALREADY_RATED: 409,
  // 429
  RATE_LIMITED: 429,
  // 500
  INTERNAL_ERROR: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_STATUS;

export const errorCodeSchema = z.enum(Object.keys(ERROR_STATUS) as [ErrorCode, ...ErrorCode[]]);

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && Object.hasOwn(ERROR_STATUS, value);
}

// Default messages, safe to show users. The server can send a more specific one.
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_FAILED: "Some of that didn't look right. Check the highlighted fields.",
  CANNOT_TRADE_WITH_SELF: "You can't trade with yourself, sadly.",
  UNAUTHENTICATED: "Log in to keep going.",
  FORBIDDEN: "You don't have access to that.",
  EMAIL_NOT_VERIFIED: "Verify your email first. Check your inbox for the link.",
  NOT_TRADE_MEMBER: "That trade isn't yours.",
  CANNOT_ACCEPT_OWN_OFFER: "This is your offer. Wait for the other person to respond.",
  ITEM_NOT_OWNED: "You can only offer your own gear.",
  NOT_FOUND: "We couldn't find that.",
  TRADE_NOT_FOUND: "We couldn't find that trade.",
  CONFLICT: "Something changed while you were looking. Refresh and try again.",
  TRADE_NOT_PENDING: "This trade already moved on. Refresh to see the latest.",
  TRADE_NOT_ACCEPTED: "This trade hasn't been accepted yet.",
  ITEM_NOT_AVAILABLE: "One of those items is no longer available.",
  ALREADY_RATED: "You already rated this trade.",
  RATE_LIMITED: "Whoa, slow down a little. Try again in a minute.",
  INTERNAL_ERROR: "Something went wrong on our side. Try again in a moment.",
};

// ---------------------------------------------------------------------------
// Response shape
// ---------------------------------------------------------------------------

// Success: { "data": ... }
export type ApiSuccess<T> = { data: T };

// Error: { "error": { "code", "message", "fields"? } }
// `fields` is only set for VALIDATION_FAILED, keyed by field path ("cash.amount"),
// so forms can show the error under the right input.
export const apiErrorSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    fields: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const PAGE_LIMIT_DEFAULT = 20;
export const PAGE_LIMIT_MAX = 50;

// `?cursor=<opaque>&limit=20`. Endpoints add their own filters with `.extend()`.
export const pageQuerySchema = z.strictObject({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PAGE_LIMIT_MAX).default(PAGE_LIMIT_DEFAULT),
});

export type PageQuery = z.infer<typeof pageQuerySchema>;

// A page of results. `nextCursor` is null on the last page.
export type Page<T> = { items: T[]; nextCursor: string | null };

export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), nextCursor: z.string().nullable() });
}
