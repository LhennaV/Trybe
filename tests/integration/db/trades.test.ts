import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createUser, deleteUsers, testSql } from "../helpers";

// The trade tables (migrations 0010 and 0011): the rules the database itself
// enforces, and what happens to history when accounts or items are deleted
// (decided 2026-11-17). The trade functions get their own tests.
const sql = testSql();
const created: string[] = [];
let alice: string;
let bob: string;
let wheelsId: string;

async function newItem(ownerId: string, name: string) {
  const [row] = await sql`
    insert into public.items (owner_id, name, category_id, condition, up_for_trade)
    values (${ownerId}, ${name}, ${wheelsId}, 'good', true)
    returning id`;
  return row.id as string;
}

// A pending trade from `from` to `to` with one item each way, the way the
// propose function will build it.
async function newTrade(from: string, to: string, cash?: { amount: number; from: "initiator" | "recipient" }) {
  const [give, want] = [await newItem(from, "Canon AE-1"), await newItem(to, "Shimpo wheel")];
  const [trade] = await sql`
    insert into public.trades (initiator_id, recipient_id) values (${from}, ${to}) returning id`;
  const [offer] = await sql`
    insert into public.trade_offers (trade_id, made_by, cash_amount, cash_from)
    values (${trade.id}, ${from}, ${cash?.amount ?? null}, ${cash?.from ?? null})
    returning id`;
  await sql`
    insert into public.trade_offer_items (offer_id, item_id, item_name, side) values
      (${offer.id}, ${give}, 'Canon AE-1', 'initiator'),
      (${offer.id}, ${want}, 'Shimpo wheel', 'recipient')`;
  await sql`update public.trades set current_offer_id = ${offer.id} where id = ${trade.id}`;
  return { tradeId: trade.id as string, offerId: offer.id as string, give, want };
}

beforeAll(async () => {
  const [a, b] = [await createUser({ label: "alice" }), await createUser({ label: "bob" })];
  created.push(a.id, b.id);
  [alice, bob] = [a.id, b.id];
  const [wheels] = await sql`
    select c.id from public.categories c join public.hobbies h on h.id = c.hobby_id
    where h.slug = 'pottery' and c.slug = 'wheels-kilns'`;
  wheelsId = wheels.id;
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("trades", () => {
  it("starts pending and points at its current offer", async () => {
    const { tradeId, offerId } = await newTrade(alice, bob);
    const [trade] = await sql`select status, current_offer_id from public.trades where id = ${tradeId}`;
    expect(trade).toEqual({ status: "pending", current_offer_id: offerId });
  });

  it("refuses a trade with yourself (CANNOT_TRADE_WITH_SELF)", async () => {
    await expect(sql`insert into public.trades (initiator_id, recipient_id) values (${alice}, ${alice})`).rejects.toThrow(
      /ck_trades_not_self/,
    );
  });

  it("refuses unknown statuses, and a cancel reason without cancelling", async () => {
    const { tradeId } = await newTrade(alice, bob);
    await expect(sql`update public.trades set status = 'countered' where id = ${tradeId}`).rejects.toThrow(
      /ck_trades_status/,
    );
    await expect(sql`update public.trades set cancel_reason = 'withdrawn' where id = ${tradeId}`).rejects.toThrow(
      /ck_trades_cancel_reason_when_cancelled/,
    );
    await expect(sql`update public.trades set status = 'cancelled' where id = ${tradeId}`).rejects.toThrow(
      /ck_trades_cancel_reason_when_cancelled/,
    );
    await sql`update public.trades set status = 'cancelled', cancel_reason = 'withdrawn' where id = ${tradeId}`;
  });

  it("records trade changes in the audit log", async () => {
    const { tradeId } = await newTrade(alice, bob);
    const [entry] = await sql`
      select count(*)::int as n from app.audit_log where table_name = 'trades' and record_id = ${tradeId}`;
    expect(entry.n).toBeGreaterThanOrEqual(1);
  });
});

describe("trade offers", () => {
  it("takes cash only as whole pesos with a direction, both or neither", async () => {
    const { offerId } = await newTrade(alice, bob, { amount: 1500, from: "initiator" });
    const [offer] = await sql`select cash_amount, cash_from from public.trade_offers where id = ${offerId}`;
    expect(offer).toEqual({ cash_amount: 1500, cash_from: "initiator" });

    const { tradeId } = await newTrade(alice, bob);
    for (const [amount, from, constraint] of [
      [1500, null, "ck_trade_offers_cash_pair"],
      [null, "initiator", "ck_trade_offers_cash_pair"],
      [0, "initiator", "ck_trade_offers_cash_amount"],
      [100, "someone", "ck_trade_offers_cash_from"],
    ] as const) {
      await expect(
        sql`insert into public.trade_offers (trade_id, made_by, cash_amount, cash_from)
            values (${tradeId}, ${alice}, ${amount}, ${from})`,
      ).rejects.toThrow(new RegExp(constraint));
    }
  });

  it("puts each item in an offer once", async () => {
    const { offerId, give } = await newTrade(alice, bob);
    await expect(
      sql`insert into public.trade_offer_items (offer_id, item_id, item_name, side)
          values (${offerId}, ${give}, 'Canon AE-1', 'initiator')`,
    ).rejects.toThrow(/uq_trade_offer_items_offer_id_item_id/);
  });
});

describe("history after deletes (decided 2026-11-17)", () => {
  it("keeps the trade for the other person when an account is deleted", async () => {
    const leaver = await createUser({ label: "leaver" });
    const { tradeId, offerId } = await newTrade(leaver.id, bob);

    await deleteUsers([leaver.id]);

    const [trade] = await sql`select initiator_id, recipient_id from public.trades where id = ${tradeId}`;
    expect(trade).toEqual({ initiator_id: null, recipient_id: bob });
    const [offer] = await sql`select made_by from public.trade_offers where id = ${offerId}`;
    expect(offer.made_by).toBeNull();
  });

  it("keeps an offer readable after its item is deleted", async () => {
    const { offerId, give } = await newTrade(alice, bob);
    await sql`delete from public.items where id = ${give}`;

    const rows = await sql`
      select item_id, item_name, side from public.trade_offer_items where offer_id = ${offerId} order by side`;
    expect(rows[0]).toEqual({ item_id: null, item_name: "Canon AE-1", side: "initiator" });
  });

  it("removes offers and their items with their trade", async () => {
    const { tradeId, offerId } = await newTrade(alice, bob);
    await sql`delete from public.trades where id = ${tradeId}`;
    const [left] = await sql`
      select
        (select count(*) from public.trade_offers where id = ${offerId})::int as offers,
        (select count(*) from public.trade_offer_items where offer_id = ${offerId})::int as items`;
    expect(left).toEqual({ offers: 0, items: 0 });
  });
});
