import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as readRoute } from "@/app/api/notifications/read/route";
import { GET as listRoute } from "@/app/api/notifications/route";
import { GET as unreadRoute } from "@/app/api/notifications/unread/route";
import { pageSchema } from "@/shared/contracts/common";
import { notificationSchema } from "@/shared/contracts/notifications";
import { accept, categoryId, complete, counter, itemStatus, newItem, propose, tradeRow } from "../db/tradeHelpers";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// Notifications (migrations 0024 and 0025, NOTIF-01) and the two daily jobs
// in the same migration: expired meetups and the notifications purge.
const sql = testSql();
const created: string[] = [];
type Person = { id: string; token: string; handle: string };
let category: string;
const TRINOMA = "5b0d6c1e-3f7a-4c2e-9a51-0e8f4d2b7c01";

async function person(label: string): Promise<Person> {
  const user = await createUser({ label });
  created.push(user.id);
  return { id: user.id, handle: user.handle, token: await accessToken(user.email) };
}

async function inbox(as: Person) {
  const res = await readJson(await listRoute(apiRequest("/api/notifications?limit=50", { token: as.token }), undefined));
  return pageSchema(notificationSchema).parse(res.body.data).items;
}
// Oldest first, as [type, actor handle].
async function story(as: Person) {
  return (await inbox(as)).reverse().map((n) => [n.type, n.actor?.handle ?? null]);
}
async function unread(as: Person) {
  return (await readJson(await unreadRoute(apiRequest("/api/notifications/unread", { token: as.token }), undefined)))
    .body.data.count as number;
}
async function markRead(as: Person, body: unknown) {
  return readJson(
    await readRoute(apiRequest("/api/notifications/read", { method: "POST", token: as.token, body }), undefined),
  );
}

async function tradeBetween(a: Person, b: Person) {
  const give = await newItem(sql, a.id, category);
  const want = await newItem(sql, b.id, category);
  return { tradeId: await propose(sql, a.id, [give], [want]), give, want };
}

beforeAll(async () => {
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("who gets told what (NOTIF-01)", () => {
  it("follows a whole trade, never telling people about their own actions", async () => {
    const [ana, ben] = [await person("ntana"), await person("ntben")];
    const { tradeId } = await tradeBetween(ana, ben);
    await counter(sql, tradeId, ben.id, [await newItem(sql, ben.id, category)], [await newItem(sql, ana.id, category)]);
    await accept(sql, tradeId, ana.id);
    await sql`select app.trade_set_meetup(${tradeId}, ${ana.id}, ${TRINOMA}, now() + interval '2 days')`;
    await sql`select app.trade_confirm_meetup(${tradeId}, ${ben.id})`;
    await complete(sql, tradeId, ana.id);
    await complete(sql, tradeId, ben.id);
    await sql`select app.rating_submit(${tradeId}, ${ana.id}, 5, '{}'::text[], null)`;

    expect(await story(ben)).toEqual([
      ["trade_proposed", ana.handle],
      ["trade_accepted", ana.handle],
      ["meetup_suggested", ana.handle],
      ["trade_completed", null],
      ["rating_received", ana.handle],
    ]);
    expect(await story(ana)).toEqual([
      ["trade_countered", ben.handle],
      ["meetup_confirmed", ben.handle],
      ["trade_completed", null],
    ]);
    expect((await inbox(ben)).every((n) => n.tradeId === tradeId && n.conversationId === null)).toBe(true);
  });

  it("folds unread chat messages from one thread into one notification", async () => {
    const [ana, ben] = [await person("fldana"), await person("fldben")];
    const { tradeId } = await tradeBetween(ana, ben);
    await markRead(ben, {});
    for (const body of ["hi", "are you there?", "hello"]) {
      await sql`insert into public.messages (trade_id, sender_id, type, body) values (${tradeId}, ${ana.id}, 'text', ${body})`;
    }
    expect(await story(ben)).toEqual([["trade_proposed", ana.handle], ["message", ana.handle]]);
    expect(await unread(ben)).toBe(1);

    // Once read, the next message is a new notification.
    await markRead(ben, {});
    await sql`insert into public.messages (trade_id, sender_id, type, body) values (${tradeId}, ${ana.id}, 'text', 'still there?')`;
    expect(await unread(ben)).toBe(1);
    expect((await inbox(ben)).filter((n) => n.type === "message")).toHaveLength(2);
  });

  it("calls a first message from a stranger a message request", async () => {
    const [mika, lhen] = [await person("ntmika"), await person("ntlhen")];
    const [a, b] = mika.id < lhen.id ? [mika.id, lhen.id] : [lhen.id, mika.id];
    const [c] = await sql`
      insert into public.conversations (user_a_id, user_b_id, started_by) values (${a}, ${b}, ${mika.id}) returning id`;
    await sql`insert into public.messages (conversation_id, sender_id, type, body) values (${c.id}, ${mika.id}, 'text', 'hi!')`;

    const [request] = await inbox(lhen);
    expect(request).toMatchObject({ type: "message_request", conversationId: c.id, tradeId: null, read: false });
    expect(await inbox(mika)).toEqual([]);
  });
});

describe("reading notifications", () => {
  it("counts unread ones and marks some or all as read, only your own", async () => {
    const [ana, ben, cy] = [await person("rdana"), await person("rdben"), await person("rdcy")];
    await tradeBetween(ana, ben);
    await tradeBetween(ana, ben);
    await tradeBetween(cy, ana);
    expect(await unread(ben)).toBe(2);

    const [newest] = await inbox(ben);
    const cysOwn = (await inbox(ana))[0];
    const one = await markRead(ben, { ids: [newest.id, cysOwn.id] });
    expect(one.body.data).toEqual({ count: 1 });
    expect(await unread(ana)).toBe(1); // ben can't mark ana's as read

    expect((await markRead(ben, {})).body.data).toEqual({ count: 0 });
    expect((await inbox(ben)).every((n) => n.read)).toBe(true);
    expect((await markRead(ben, { ids: [] })).status).toBe(400);
    expect(
      (await readJson(await listRoute(apiRequest("/api/notifications"), undefined))).status,
    ).toBe(401);
  });
});

describe("daily jobs (docs/database.md section 8)", () => {
  it("cancels accepted trades 72 hours after a missed meetup and frees the items", async () => {
    const [ana, ben] = [await person("expana"), await person("expben")];
    const { tradeId, give, want } = await tradeBetween(ana, ben);
    await accept(sql, tradeId, ben.id);
    const fresh = await tradeBetween(ana, ben);
    await accept(sql, fresh.tradeId, ben.id);
    // A meetup four days ago, and one yesterday (not due yet).
    await sql`update public.trades set meetup_spot_id = ${TRINOMA}, meetup_at = now() - interval '4 days', meetup_proposed_by = ${ana.id} where id = ${tradeId}`;
    await sql`update public.trades set meetup_spot_id = ${TRINOMA}, meetup_at = now() - interval '1 day', meetup_proposed_by = ${ana.id} where id = ${fresh.tradeId}`;

    const [run] = await sql`select app.trades_expire_meetups() as n`;
    expect(run.n).toBeGreaterThanOrEqual(1);
    expect(await tradeRow(sql, tradeId)).toMatchObject({ status: "cancelled", cancel_reason: "meetup_expired", cancelled_by: null });
    expect([await itemStatus(sql, give), await itemStatus(sql, want)]).toEqual(["available", "available"]);
    expect((await tradeRow(sql, fresh.tradeId)).status).toBe("accepted");

    // Both people hear about it, and the chat says why.
    for (const who of [ana, ben]) {
      expect((await inbox(who)).find((n) => n.tradeId === tradeId && n.type === "trade_cancelled")?.actor).toBeNull();
    }
    const [line] = await sql`
      select body from public.messages where trade_id = ${tradeId} and type = 'system' order by created_at desc limit 1`;
    expect(line.body).toBe("Trade cancelled: the meetup time passed.");
  });

  it("purges read notifications after 90 days, never unread ones", async () => {
    const ana = await person("prgana");
    const [oldRead, oldUnread] = await sql`
      insert into public.notifications (user_id, type, read_at, created_at) values
        (${ana.id}, 'trade_completed', now() - interval '91 days', now() - interval '100 days'),
        (${ana.id}, 'trade_completed', null, now() - interval '100 days')
      returning id`;
    await sql`select app.notifications_purge()`;
    const left = await sql`select id from public.notifications where id in (${oldRead.id}, ${oldUnread.id})`;
    expect(left.map((r) => r.id)).toEqual([oldUnread.id]);
  });

  it("schedules both jobs daily", async () => {
    const jobs = await sql`
      select jobname, schedule from cron.job
      where jobname in ('trades_expire_meetups', 'notifications_purge') order by jobname`;
    expect(jobs).toEqual([
      { jobname: "notifications_purge", schedule: "30 19 * * *" },
      { jobname: "trades_expire_meetups", schedule: "0 19 * * *" },
    ]);
  });
});
