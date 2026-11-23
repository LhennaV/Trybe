import { z } from "zod";
import { AppError } from "@/server/errors";

// An id from the URL (/api/posts/:id). Anything that isn't a uuid can't
// exist, so it's a 404, not a validation error.
export function idParam(value: string, what: "item" | "post" | "trade" | "chat"): string {
  const parsed = z.uuid().safeParse(value);
  if (!parsed.success) {
    throw what === "trade" ? new AppError("TRADE_NOT_FOUND") : new AppError("NOT_FOUND", `We couldn't find that ${what}.`);
  }
  return parsed.data;
}
