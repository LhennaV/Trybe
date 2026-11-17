// Postgres errors can arrive bare (postgres-js) or wrapped by Drizzle in
// `cause`. Walks the chain to find the one with a SQLSTATE code.
export type PgError = { code: string; message: string; constraint?: string; detail?: string };

export function findPgError(error: unknown): PgError | null {
  let current: unknown = error;
  for (let depth = 0; current instanceof Error && depth < 5; depth++) {
    const { code, constraint_name: constraint, detail } = current as {
      code?: unknown;
      constraint_name?: unknown;
      detail?: unknown;
    };
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) {
      return {
        code,
        message: current.message,
        ...(typeof constraint === "string" && { constraint }),
        ...(typeof detail === "string" && { detail }),
      };
    }
    current = current.cause;
  }
  return null;
}

// SQLSTATE codes the server code reacts to.
export const PG_UNIQUE_VIOLATION = "23505";
export const PG_FOREIGN_KEY_VIOLATION = "23503";
// Raised by our own database functions with a stable code as the message
// (docs/database.md section 5.3).
export const PG_RAISE_EXCEPTION = "P0001";
// Two transactions got in each other's way. Safe for the client to retry.
export const PG_DEADLOCK = "40P01";
export const PG_SERIALIZATION_FAILURE = "40001";
