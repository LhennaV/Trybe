import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import { AppError } from "@/server/errors";

// Confirms the app can reach Postgres through the pooler.
export async function checkHealth() {
  const started = Date.now();
  try {
    await getDb().execute(sql`select 1`);
  } catch (error) {
    console.error(error);
    throw new AppError("INTERNAL_ERROR", "The database is unreachable.");
  }
  return { status: "ok" as const, databaseMs: Date.now() - started };
}
