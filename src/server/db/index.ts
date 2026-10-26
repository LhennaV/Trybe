import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url)
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );

  // DATABASE_URL is the Supabase transaction pooler, which doesn't support
  // prepared statements, so they're turned off.
  const client = postgres(url, { prepare: false });
  return drizzle({ client, schema });
}

export type Db = ReturnType<typeof createDb>;

// One client per server instance. Kept on globalThis so dev hot reloads
// don't open a new pool on every change.
const globalForDb = globalThis as unknown as { trybeDb?: Db };

// Created on first use, not on import, so builds don't need a database.
export function getDb(): Db {
  globalForDb.trybeDb ??= createDb();
  return globalForDb.trybeDb;
}
