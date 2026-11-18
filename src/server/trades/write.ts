import "server-only";
import { sql, type SQL } from "drizzle-orm";
import type { CancelTrade, CounterOffer, OfferTerms, ProposeTrade, SubmitRating } from "@/shared/contracts/trades";
import type { SessionUser } from "@/server/auth/session";
import { withActor, type Tx } from "@/server/db/withActor";
import { toTradeError } from "@/server/trades/dbErrors";

// Trade actions (TRD sections 8.6 and 11). Each one calls its database
// function (migration 0012), which locks the trade and checks every rule. The
// state machine (./stateMachine.ts) writes down the same rules, and the
// integration tests run the same matrix against both.

// A uuid[] parameter. Drizzle would otherwise spread a JS array into a list.
function uuidArray(ids: string[]): SQL {
  return sql`array[${sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `,
  )}]::uuid[]`;
}

// A text[] parameter; an empty list still needs its type.
function textArray(values: string[]): SQL {
  if (values.length === 0) return sql`'{}'::text[]`;
  return sql`array[${sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  )}]::text[]`;
}

// The offer arguments every propose and counter call shares. Cash `from` stays
// "me" or "them"; the function stores it as initiator or recipient.
function offerArgs(terms: OfferTerms): SQL {
  return sql`${uuidArray(terms.giveItemIds)}, ${uuidArray(terms.wantItemIds)},
    ${terms.cash?.amount ?? null}::integer, ${terms.cash?.from ?? null}::text`;
}

async function run<T>(actorId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  try {
    return await withActor(actorId, fn);
  } catch (error) {
    throw toTradeError(error);
  }
}

// POST /api/trades (TRD-01, TRD-02, TRD-09). Returns the new trade's id.
export async function proposeTrade(user: SessionUser, input: ProposeTrade): Promise<string> {
  return run(user.id, async (tx) => {
    const [row] = await tx.execute<{ id: string }>(sql`select app.trade_propose(${user.id}, ${offerArgs(input)}) as id`);
    return row.id;
  });
}

// POST /api/trades/:id/counter (TRD-03). Returns the new offer's id.
export async function counterTrade(user: SessionUser, tradeId: string, input: CounterOffer): Promise<string> {
  return run(user.id, async (tx) => {
    const [row] = await tx.execute<{ id: string }>(
      sql`select app.trade_counter(${tradeId}, ${user.id}, ${offerArgs(input)}) as id`,
    );
    return row.id;
  });
}

// POST /api/trades/:id/accept (TRD-04, TRD-06)
export async function acceptTrade(user: SessionUser, tradeId: string): Promise<void> {
  await run(user.id, (tx) => tx.execute(sql`select app.trade_accept(${tradeId}, ${user.id})`));
}

// POST /api/trades/:id/decline (TRD-04)
export async function declineTrade(user: SessionUser, tradeId: string): Promise<void> {
  await run(user.id, (tx) => tx.execute(sql`select app.trade_decline(${tradeId}, ${user.id})`));
}

// POST /api/trades/:id/ratings (RATE-01). Hidden from the other person until
// they rate too or 7 days pass (RATE-02).
export async function rateTrade(user: SessionUser, tradeId: string, input: SubmitRating): Promise<void> {
  await run(user.id, (tx) =>
    tx.execute(
      sql`select app.rating_submit(${tradeId}, ${user.id}, ${input.score}::integer,
        ${textArray(input.tags)}, ${input.note ?? null}::text)`,
    ),
  );
}

// POST /api/trades/:id/cancel (TRD-08, MEET-06). The note is for the no-show
// report, which comes with the reports table in Phase 5.
export async function cancelTrade(user: SessionUser, tradeId: string, input: CancelTrade): Promise<void> {
  await run(user.id, (tx) => tx.execute(sql`select app.trade_cancel(${tradeId}, ${user.id}, ${input.reason})`));
}
