import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppError } from "@/server/errors";
import { proposeTrade } from "@/server/trades/write";
import { TRADE_MATRIX, type MatrixCase } from "../../unit/server/trades/matrix";
import { createUser, deleteUsers, testSql } from "../helpers";
import {
  accept,
  cancel,
  categoryId,
  codeOf,
  counter,
  decline,
  itemStatus,
  newItem,
  propose,
  tradeRow,
} from "./tradeHelpers";

// The trade database functions (migration 0012, docs/database.md section 5).
// The rules matrix from the state machine runs here against Postgres, so the
// two can't drift apart (docs/testing.md section 7.1). Concurrency has its
// own file.
const sql = testSql();
const created: string[] = [];
let maker: string; // makes the first offer in every trade below
let responder: string;
let outsider: string;
let category: string;

const item = (owner: string, options?: Parameters<typeof newItem>[3]) => newItem(sql, owner, category, options);

// A pending trade from maker to responder, one item each way.
async function pendingTrade() {
  const give = await item(maker);
  const want = await item(responder);
  return { tradeId: await propose(sql, maker, [give], [want]), give, want };
}

// A trade in `status`, built only through the functions (except "completed",
// which needs Phase 4's confirm function).
async function tradeIn(status: MatrixCase["status"]) {
  const { tradeId } = await pendingTrade();
  if (status === "accepted" || status === "completed") await accept(sql, tradeId, responder);
  if (status === "completed") await sql`update public.trades set status = 'completed' where id = ${tradeId}`;
  if (status === "declined") await decline(sql, tradeId, responder);
  if (status === "cancelled") await cancel(sql, tradeId, maker);
  return tradeId;
}

beforeAll(async () => {
  const users = [
    await createUser({ label: "maker" }),
    await createUser({ label: "responder" }),
    await createUser({ label: "outsider" }),
  ];
  created.push(...users.map((u) => u.id));
  [maker, responder, outsider] = users.map((u) => u.id);
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("rules matrix against the database (docs/testing.md section 7.1)", () => {
  // confirm_complete comes with Phase 4.
  const cases = TRADE_MATRIX.filter((c) => c.action !== "confirm_complete");
  const actorId = (actor: MatrixCase["actor"]) => ({ maker, responder, outsider })[actor];

  it.each(cases)("$status: $actor $action → $expected", async ({ status, action, actor, expected }) => {
    const tradeId = await tradeIn(status);
    const who = actorId(actor);
    const other = who === maker ? responder : maker;

    const call = {
      counter: async () => counter(sql, tradeId, who, [await item(who)], [await item(other)]),
      accept: () => accept(sql, tradeId, who),
      decline: () => decline(sql, tradeId, who),
      cancel: () => cancel(sql, tradeId, who),
    }[action as "counter" | "accept" | "decline" | "cancel"];

    const code = await codeOf(call());
    const result = code ?? (await tradeRow(sql, tradeId)).status;
    expect(result).toBe(expected);
  });
});

describe("trade_propose", () => {
  it("creates a pending trade with the owner of the wanted items as recipient", async () => {
    const give = await item(maker, { name: "Canon AE-1" });
    const want = await item(responder, { name: "Shimpo wheel" });
    const tradeId = await propose(sql, maker, [give], [want], { amount: 500, from: "me" });

    const trade = await tradeRow(sql, tradeId);
    expect(trade).toMatchObject({ status: "pending", initiator_id: maker, recipient_id: responder });

    const [offer] = await sql`
      select made_by, cash_amount, cash_from from public.trade_offers where id = ${trade.current_offer_id}`;
    expect(offer).toEqual({ made_by: maker, cash_amount: 500, cash_from: "initiator" });

    const lines = await sql`
      select item_id, item_name, side from public.trade_offer_items
      where offer_id = ${trade.current_offer_id} order by side`;
    expect(lines).toEqual([
      { item_id: give, item_name: "Canon AE-1", side: "initiator" },
      { item_id: want, item_name: "Shimpo wheel", side: "recipient" },
    ]);
  });

  it("refuses offers that break the rules", async () => {
    const mine = await item(maker);
    const theirs = await item(responder);
    const unverified = await createUser({ label: "unverif", verified: false });
    created.push(unverified.id);

    const expectCode = async (call: () => Promise<unknown>, expected: string) =>
      expect(await codeOf(call())).toBe(expected);

    const ownUnverified = await item(unverified.id);
    await expectCode(() => propose(sql, unverified.id, [ownUnverified], [theirs]), "EMAIL_NOT_VERIFIED");
    await expectCode(async () => propose(sql, maker, [theirs], [await item(responder)]), "ITEM_NOT_OWNED");
    await expectCode(async () => propose(sql, maker, [mine], [await item(maker)]), "CANNOT_TRADE_WITH_SELF");
    await expectCode(async () => propose(sql, maker, [mine], [theirs, await item(outsider)]), "VALIDATION_FAILED");
    await expectCode(
      async () => propose(sql, maker, [mine], [await item(responder, { upForTrade: false })]),
      "ITEM_NOT_AVAILABLE",
    );
    await expectCode(
      async () => propose(sql, maker, [mine], [await item(responder, { status: "reserved" })]),
      "ITEM_NOT_AVAILABLE",
    );
    await expectCode(
      async () => propose(sql, maker, [await item(maker, { status: "traded" })], [theirs]),
      "ITEM_NOT_AVAILABLE",
    );
    await expectCode(() => propose(sql, maker, [mine], ["00000000-0000-4000-8000-000000000000"]), "ITEM_NOT_AVAILABLE");
    await expectCode(() => propose(sql, maker, [mine, mine], [theirs]), "VALIDATION_FAILED");
    await expectCode(() => propose(sql, maker, [], [theirs]), "VALIDATION_FAILED");
    // Cash needs both an amount and who pays.
    await expectCode(
      async () => sql`select app.trade_propose(${maker}, ${`{${mine}}`}::uuid[], ${`{${theirs}}`}::uuid[], 100, null)`,
      "VALIDATION_FAILED",
    );
  });

  it("lets your own gear be offered even when it isn't marked up for trade", async () => {
    const give = await item(maker, { upForTrade: false });
    const tradeId = await propose(sql, maker, [give], [await item(responder)]);
    expect((await tradeRow(sql, tradeId)).status).toBe("pending");
  });
});

describe("trade_counter", () => {
  it("adds a new offer, keeps the trade pending, and hands the turn back", async () => {
    const { tradeId } = await pendingTrade();
    const before = await tradeRow(sql, tradeId);

    const offerId = await counter(sql, tradeId, responder, [await item(responder)], [await item(maker)], {
      amount: 200,
      from: "me",
    });

    const after = await tradeRow(sql, tradeId);
    expect(after.status).toBe("pending");
    expect(after.current_offer_id).toBe(offerId);
    expect(offerId).not.toBe(before.current_offer_id);

    const [offer] = await sql`select made_by, cash_from from public.trade_offers where id = ${offerId}`;
    expect(offer).toEqual({ made_by: responder, cash_from: "recipient" });

    // Now the responder made the current offer, so they wait and the maker answers.
    expect(await codeOf(accept(sql, tradeId, responder))).toBe("CANNOT_ACCEPT_OWN_OFFER");
    await accept(sql, tradeId, maker);
    expect((await tradeRow(sql, tradeId)).status).toBe("accepted");
  });

  it("only asks for the other person's items", async () => {
    const { tradeId } = await pendingTrade();
    const code = await codeOf(counter(sql, tradeId, responder, [await item(responder)], [await item(outsider)]));
    expect(code).toBe("VALIDATION_FAILED");
  });
});

describe("trade_accept", () => {
  it("reserves the items and cancels other pending trades that used them", async () => {
    const { tradeId, give, want } = await pendingTrade();

    // Someone else wants the same item; an unrelated trade shouldn't change.
    const rival = await propose(sql, outsider, [await item(outsider)], [want]);
    const unrelated = await propose(sql, outsider, [await item(outsider)], [await item(responder)]);

    await accept(sql, tradeId, responder);

    expect((await tradeRow(sql, tradeId)).status).toBe("accepted");
    expect(await itemStatus(sql, give)).toBe("reserved");
    expect(await itemStatus(sql, want)).toBe("reserved");
    expect(await tradeRow(sql, rival)).toMatchObject({
      status: "cancelled",
      cancel_reason: "item_unavailable",
      cancelled_by: null,
    });
    expect((await tradeRow(sql, unrelated)).status).toBe("pending");
  });

  it("refuses when an item is no longer available", async () => {
    const { tradeId, give } = await pendingTrade();
    await sql`update public.items set status = 'traded' where id = ${give}`;
    expect(await codeOf(accept(sql, tradeId, responder))).toBe("ITEM_NOT_AVAILABLE");
    expect((await tradeRow(sql, tradeId)).status).toBe("pending");
  });
});

describe("trade_cancel", () => {
  it("frees reserved items and records who cancelled", async () => {
    const { tradeId, give, want } = await pendingTrade();
    await accept(sql, tradeId, responder);
    await cancel(sql, tradeId, maker);

    expect(await tradeRow(sql, tradeId)).toMatchObject({
      status: "cancelled",
      cancelled_by: maker,
      cancel_reason: "withdrawn",
    });
    expect(await itemStatus(sql, give)).toBe("available");
    expect(await itemStatus(sql, want)).toBe("available");
  });

  it("takes no_show only after the trade was accepted", async () => {
    const { tradeId } = await pendingTrade();
    expect(await codeOf(cancel(sql, tradeId, maker, "no_show"))).toBe("TRADE_NOT_ACCEPTED");

    await accept(sql, tradeId, responder);
    await cancel(sql, tradeId, responder, "no_show");
    expect((await tradeRow(sql, tradeId)).cancel_reason).toBe("no_show");
  });

  it("refuses reasons only the server sets", async () => {
    const { tradeId } = await pendingTrade();
    expect(await codeOf(cancel(sql, tradeId, maker, "item_unavailable"))).toBe("VALIDATION_FAILED");
  });
});

describe("deleting items and accounts (decided 2026-11-17)", () => {
  it("cancels pending trades whose current offer uses a deleted item", async () => {
    const { tradeId, give } = await pendingTrade();
    await sql`delete from public.items where id = ${give}`;
    expect(await tradeRow(sql, tradeId)).toMatchObject({ status: "cancelled", cancel_reason: "item_unavailable" });
  });

  it("cancels an accepted trade when an account goes, and frees the other person's items", async () => {
    const leaver = await createUser({ label: "leaver" });
    const give = await item(leaver.id);
    const want = await item(responder);
    const tradeId = await propose(sql, leaver.id, [give], [want]);
    await accept(sql, tradeId, responder);

    await deleteUsers([leaver.id]);

    expect(await tradeRow(sql, tradeId)).toMatchObject({
      status: "cancelled",
      cancel_reason: "item_unavailable",
      initiator_id: null,
      recipient_id: responder,
    });
    expect(await itemStatus(sql, want)).toBe("available");
  });

  it("never treats a deleted account's empty seat as a member", async () => {
    const leaver = await createUser({ label: "leaver2" });
    const tradeId = await propose(sql, leaver.id, [await item(leaver.id)], [await item(responder)]);
    await decline(sql, tradeId, responder);
    await deleteUsers([leaver.id]);

    expect(await codeOf(cancel(sql, tradeId, outsider))).toBe("NOT_TRADE_MEMBER");
  });
});

describe("server wrapper (src/server/trades/write.ts)", () => {
  it("turns database codes into AppErrors with their messages", async () => {
    const unverified = await createUser({ label: "unverif2", verified: false });
    created.push(unverified.id);
    const user = { id: unverified.id, email: unverified.email, emailVerified: false };

    const error = await proposeTrade(user, {
      giveItemIds: [await item(unverified.id)],
      wantItemIds: [await item(responder)],
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("EMAIL_NOT_VERIFIED");

    const mixed = await proposeTrade(
      { id: maker, email: "maker@example.test", emailVerified: true },
      { giveItemIds: [await item(maker)], wantItemIds: [await item(responder), await item(outsider)] },
    ).catch((e: unknown) => e);
    expect((mixed as AppError).code).toBe("VALIDATION_FAILED");
    expect((mixed as AppError).message).toBe("Everything you ask for has to come from the same person.");
  });

  it("returns the new trade's id", async () => {
    const tradeId = await proposeTrade(
      { id: maker, email: "maker@example.test", emailVerified: true },
      { giveItemIds: [await item(maker)], wantItemIds: [await item(responder)], cash: { amount: 50, from: "them" } },
    );
    const trade = await tradeRow(sql, tradeId);
    const [offer] = await sql`select cash_from from public.trade_offers where id = ${trade.current_offer_id}`;
    expect(offer.cash_from).toBe("recipient");
  });
});
