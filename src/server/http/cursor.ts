import { AppError } from "@/server/errors";

// Opaque cursors for "newest first" lists (TRD section 10, Pagination).
// A cursor is the (created_at, id) of the last row a page returned. The time
// is kept as Postgres text, with microseconds: a JavaScript Date only keeps
// milliseconds, which would skip or repeat rows created in the same
// millisecond.

export type CursorPosition = { at: string; id: string };

export function encodeCursor(position: CursorPosition): string {
  return Buffer.from(JSON.stringify([position.at, position.id])).toString("base64url");
}

export function decodeCursor(cursor: string | undefined): CursorPosition | null {
  if (!cursor) return null;
  try {
    const [at, id] = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (typeof at === "string" && typeof id === "string" && !Number.isNaN(Date.parse(at))) return { at, id };
  } catch {
    // fall through
  }
  throw new AppError("VALIDATION_FAILED", "That page link is broken. Start from the top.", {
    cursor: ["Invalid cursor."],
  });
}
