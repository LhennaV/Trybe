import { isErrorCode } from "@/shared/contracts/common";
import { findPgError, PG_DEADLOCK, PG_RAISE_EXCEPTION, PG_SERIALIZATION_FAILURE } from "@/server/db/pgError";
import { AppError } from "@/server/errors";

// Turns an error from an app.trade_* function into an AppError
// (docs/database.md section 5.3). The functions raise a stable code as the
// message; VALIDATION_FAILED carries the reason in `detail`. Anything else is
// returned as is, so the route wrapper reports it as a 500.
export function toTradeError(error: unknown): unknown {
  const pg = findPgError(error);
  if (!pg) return error;
  if (pg.code === PG_RAISE_EXCEPTION && isErrorCode(pg.message)) {
    return pg.detail ? new AppError(pg.message, pg.detail) : new AppError(pg.message);
  }
  if (pg.code === PG_DEADLOCK || pg.code === PG_SERIALIZATION_FAILURE) {
    return new AppError("CONFLICT", "Someone changed this trade at the same moment. Try again.");
  }
  return error;
}
