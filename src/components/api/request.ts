import { apiErrorSchema, ERROR_MESSAGES, type ErrorCode } from "@/shared/contracts/common";

// What the frontend gets back from any API call. Plain TS, no React, so a
// future native app can reuse it.
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; message: string; fields: Record<string, string[]> };

// Calls one of our JSON endpoints and turns the { data } / { error } shape
// (TRD section 10) into a result. Never throws: a network failure comes back
// as INTERNAL_ERROR with a friendly message.
export async function apiRequest<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: "same-origin",
    });
  } catch {
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "We couldn't reach Trybe. Check your connection and try again.",
      fields: {},
    };
  }

  const json: unknown = await response.json().catch(() => null);

  if (response.ok && json && typeof json === "object" && "data" in json) {
    return { ok: true, data: (json as { data: T }).data };
  }

  const parsed = apiErrorSchema.safeParse(json);
  if (parsed.success) {
    const { code, message, fields } = parsed.data.error;
    return { ok: false, code, message, fields: fields ?? {} };
  }

  return { ok: false, code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR, fields: {} };
}

// First error per field from a client-side Zod check, keyed like the API's
// `fields` so the same inputs show both.
export function zodFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

// First error for each field, for showing under inputs.
export function firstFieldErrors(fields: Record<string, string[]>): Record<string, string> {
  return Object.fromEntries(Object.entries(fields).map(([key, messages]) => [key, messages[0] ?? ""]));
}
