import "server-only";
import type { z } from "zod";
import { AppError } from "@/server/errors";

// Reads and validates a JSON body. Bad JSON and schema failures both become
// VALIDATION_FAILED (via the ZodError mapping in respond.ts).
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AppError("VALIDATION_FAILED", "The request body must be valid JSON.");
  }
  return schema.parse(body);
}

// Validates query string params. Repeated keys become arrays (?hobby=a&hobby=b).
export function parseQuery<T extends z.ZodType>(request: Request, schema: T): z.infer<T> {
  const params = new URL(request.url).searchParams;
  const query: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    query[key] = values.length > 1 ? values : values[0];
  }
  return schema.parse(query);
}
