import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createUser, deleteUsers, testSql } from "../helpers";
import { accept, cancel, categoryId, codeOf, itemStatus, newItem, propose, sleep, tradeRow } from "./tradeHelpers";

// Two people acting on trades at the same moment (docs/testing.md section
// 7.2). Each side gets its own connection, like two serverless functions.
// "Held" calls keep their transaction open for a moment, so the other call
// really has to wait on the row lock.
const sql = testSql();
const first = testSql();
const second = testSql();
const created: string[] = [];
let alice: string;
let bob: string;
let carol: string;
let category: string;

const item = (owner: string) => newItem(sql, owner, category);
const HOLD_MS = 300;

// Runs `call` in a transaction on `conn` and keeps it open for HOLD_MS.
async function held(conn: typeof sql, call: (tx: typeof sql) => Promise<unknown>) {
  await conn.begin(async (tx) => {
    await call(tx as unknown as typeof sql);
    await sleep(HOLD_MS);
  });
}

// Starts `late` once `early` has its locks.
async function race(early: () => Promise<unknown>, late: () => Promise<unknown>) {
  const a = codeOf(early());
  await sleep(50);
  const b = codeOf(late());
  return Promise.all([a, b]);
}

beforeAll(async () => {
  const users = [
    await createUser({ label: "alice" }),
    await createUser({ label: "bob" }),
    await createUser({ label: "carol" }),
  ];
  created.push(...users.map((u) => u.id));
  [alice, bob, carol] = users.map((u) => u.id);
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await Promise.all([sql.end(), first.end(), second.end()]);
});

describe("trade concurrency", () => {
  it("double tap on accept: the second one sees the trade already moved on", async () => {
    const want = await item(bob);
    const tradeId = await propose(sql, alice, [await item(alice)], [want]);

    const [a, b] = await race(
      () => held(first, (tx) => accept(tx, tradeId, bob)),
      () => accept(second, tradeId, bob),
    );
    expect([a, b]).toEqual([null, "TRADE_NOT_PENDING"]);
    expect(await itemStatus(sql, want)).toBe("reserved");
  });

  it("two trades for the same item accepted at once: only one wins", async () => {
    const shared = await item(bob);
    const fromAlice = await propose(sql, alice, [await item(alice)], [shared]);
    const fromCarol = await propose(sql, carol, [await item(carol)], [shared]);

    const [a, b] = await race(
      () => held(first, (tx) => accept(tx, fromAlice, bob)),
      () => accept(second, fromCarol, bob),
    );
    expect([a, b]).toEqual([null, "TRADE_NOT_PENDING"]);
    expect((await tradeRow(sql, fromAlice)).status).toBe("accepted");
    expect(await tradeRow(sql, fromCarol)).toMatchObject({ status: "cancelled", cancel_reason: "item_unavailable" });
  });

  it("cancel and accept at once: the accept waits and then refuses", async () => {
    const give = await item(alice);
    const want = await item(bob);
    const tradeId = await propose(sql, alice, [give], [want]);

    const [a, b] = await race(
      () => held(first, (tx) => cancel(tx, tradeId, alice)),
      () => accept(second, tradeId, bob),
    );
    expect([a, b]).toEqual([null, "TRADE_NOT_PENDING"]);
    expect((await tradeRow(sql, tradeId)).status).toBe("cancelled");
    expect([await itemStatus(sql, give), await itemStatus(sql, want)]).toEqual(["available", "available"]);
  });

  it("both people confirming the handoff at once complete the trade exactly once", async () => {
    const give = await item(alice);
    const want = await item(bob);
    const tradeId = await propose(sql, alice, [give], [want]);
    await accept(sql, tradeId, bob);

    const [a, b] = await Promise.all([
      first`select app.trade_confirm_complete(${tradeId}, ${alice}) as status`,
      second`select app.trade_confirm_complete(${tradeId}, ${bob}) as status`,
    ]);
    // Whoever got the lock second sees both confirms and completes it.
    expect([a[0].status, b[0].status].sort()).toEqual(["accepted", "completed"]);
    expect((await tradeRow(sql, tradeId)).status).toBe("completed");
    expect([await itemStatus(sql, give), await itemStatus(sql, want)]).toEqual(["traded", "traded"]);
  });

  it("many trades racing for one item never reserve it twice", async () => {
    for (let round = 0; round < 5; round++) {
      const shared = await item(bob);
      const fromAlice = await propose(sql, alice, [await item(alice)], [shared]);
      const fromCarol = await propose(sql, carol, [await item(carol)], [shared]);

      // No holding: both really start together. A deadlock (40P01) is allowed;
      // the API turns it into a 409 the client retries.
      const codes = await Promise.all([
        codeOf(accept(first, fromAlice, bob)),
        codeOf(accept(second, fromCarol, bob)),
      ]);
      const statuses = [(await tradeRow(sql, fromAlice)).status, (await tradeRow(sql, fromCarol)).status];

      expect(statuses.filter((s) => s === "accepted")).toHaveLength(1);
      expect(codes.filter((c) => c === null)).toHaveLength(1);
      for (const code of codes) expect([null, "TRADE_NOT_PENDING", "ITEM_NOT_AVAILABLE", "40P01"]).toContain(code);
      expect(await itemStatus(sql, shared)).toBe("reserved");
    }
  });
});
