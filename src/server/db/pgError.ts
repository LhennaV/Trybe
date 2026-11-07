// Postgres errors can arrive bare (postgres-js) or wrapped by Drizzle in
// `cause`. Walks the chain to find the one with a SQLSTATE code.
export type PgError = { code: string; message: string; constraint?: string };

export function findPgError(error: unknown): PgError | null {
  let current: unknown = error;
  for (let depth = 0; current instanceof Error && depth < 5; depth++) {
    const { code, constraint_name: constraint } = current as { code?: unknown; constraint_name?: unknown };
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) {
      return { code, message: current.message, ...(typeof constraint === "string" && { constraint }) };
    }
    current = current.cause;
  }
  return null;
}

// SQLSTATE codes the server code reacts to.
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";
