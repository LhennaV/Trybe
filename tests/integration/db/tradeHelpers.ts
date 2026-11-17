import type postgres from "postgres";

// Helpers for the trade function tests (migration 0012). They call the
// app.trade_* functions straight through SQL, the way the server does.

type Sql = postgres.Sql;

// A uuid[] literal. The ids come from the database, so they're safe, and it
// still goes in as a bind parameter.
export const uuids = (ids: string[]) => `{${ids.join(",")}}`;

export async function categoryId(sql: Sql) {
  const [row] = await sql`
    select c.id from public.categories c join public.hobbies h on h.id = c.hobby_id
    where h.slug = 'pottery' and c.slug = 'wheels-kilns'`;
  return row.id as string;
}

export async function newItem(
  sql: Sql,
  ownerId: string,
  category: string,
  options: { name?: string; upForTrade?: boolean; status?: string } = {},
) {
  const [row] = await sql`
    insert into public.items (owner_id, name, category_id, condition, up_for_trade, status)
    values (${ownerId}, ${options.name ?? "Test gear"}, ${category}, 'good',
            ${options.upForTrade ?? true}, ${options.status ?? "available"})
    returning id`;
  return row.id as string;
}

type Cash = { amount: number; from: "me" | "them" };

export async function propose(sql: Sql, actor: string, give: string[], want: string[], cash?: Cash) {
  const [row] = await sql`
    select app.trade_propose(${actor}, ${uuids(give)}::uuid[], ${uuids(want)}::uuid[],
      ${cash?.amount ?? null}::integer, ${cash?.from ?? null}::text) as id`;
  return row.id as string;
}

export async function counter(sql: Sql, tradeId: string, actor: string, give: string[], want: string[], cash?: Cash) {
  const [row] = await sql`
    select app.trade_counter(${tradeId}, ${actor}, ${uuids(give)}::uuid[], ${uuids(want)}::uuid[],
      ${cash?.amount ?? null}::integer, ${cash?.from ?? null}::text) as id`;
  return row.id as string;
}

export async function accept(sql: Sql, tradeId: string, actor: string) {
  await sql`select app.trade_accept(${tradeId}, ${actor})`;
}

export async function decline(sql: Sql, tradeId: string, actor: string) {
  await sql`select app.trade_decline(${tradeId}, ${actor})`;
}

export async function cancel(sql: Sql, tradeId: string, actor: string, reason = "withdrawn") {
  await sql`select app.trade_cancel(${tradeId}, ${actor}, ${reason})`;
}

export async function tradeRow(sql: Sql, tradeId: string) {
  const [row] = await sql`
    select status, initiator_id, recipient_id, current_offer_id, cancelled_by, cancel_reason
    from public.trades where id = ${tradeId}`;
  return row;
}

export async function itemStatus(sql: Sql, itemId: string) {
  const [row] = await sql`select status from public.items where id = ${itemId}`;
  return row?.status as string | undefined;
}

// The error code a call failed with, or null if it worked.
export async function codeOf(promise: Promise<unknown>): Promise<string | null> {
  try {
    await promise;
    return null;
  } catch (error) {
    const { code, message } = error as { code?: string; message?: string };
    return code === "P0001" ? (message ?? "") : (code ?? String(error));
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
