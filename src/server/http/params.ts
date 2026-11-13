import { z } from "zod";
import { AppError } from "@/server/errors";

// An id from the URL (/api/posts/:id). Anything that isn't a uuid can't
// exist, so it's a 404, not a validation error.
export function idParam(value: string, what: "item" | "post"): string {
  const parsed = z.uuid().safeParse(value);
  if (!parsed.success) throw new AppError("NOT_FOUND", `We couldn't find that ${what}.`);
  return parsed.data;
}
