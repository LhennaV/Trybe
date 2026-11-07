import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "@/server/db";

export type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

// Runs `fn` in a transaction with the acting user recorded for the audit
// trail (docs/database.md section 7.3). Use it for every write a user makes.
// The setting lasts only for this transaction, so it's safe on the pooler.
export function withActor<T>(actorId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.actor_id', ${actorId}, true)`);
    return fn(tx);
  });
}
