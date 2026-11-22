import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as listRoute, POST as sendRoute } from "@/app/api/trades/[id]/messages/route";
import { pageSchema } from "@/shared/contracts/common";
import { messageSchema, type Message } from "@/shared/contracts/trades";
import { accept, cancel, categoryId, complete, counter, decline, newItem, propose } from "../db/tradeHelpers";
import { accessToken, anonClient, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// Trade chat (migrations 0017 and 0018, CHAT-01, CHAT-04, TRD section 12):
// the API writes and lists messages; the two people in the trade, and only
// they, can also read them straight from Supabase (what Realtime uses).
const sql = testSql();
const created: string[] = [];
type Person = { id: string; token: string };
let ana: Person;
let ben: Person;
let cy: Person;
let category: string;

async function person(label: string): Promise<Person> {
  const user = await createUser({ label });
  created.push(user.id);
  return { id: user.id, token: await accessToken(user.email) };
}

async function newTrade() {
  return propose(sql, ana.id, [await newItem(sql, ana.id, category)], [await newItem(sql, ben.id, category)]);
}

const texts = (items: Message[]) => items.filter((m) => m.type === "text");

const params = (id: string) => ({ params: Promise.resolve({ id }) });

async function send(as: Person | null, tradeId: string, body: unknown) {
  return readJson(
    await sendRoute(
      apiRequest(`/api/trades/${tradeId}/messages`, { method: "POST", token: as?.token, body }),
      params(tradeId),
    ),
  );
}

async function list(as: Person | null, tradeId: string, query = "") {
  return readJson(
    await listRoute(apiRequest(`/api/trades/${tradeId}/messages${query}`, { token: as?.token }), params(tradeId)),
  );
}

// Supabase as the browser or the app sees it: anon key plus the user's token.
function supabaseAs(as: Person) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${as.token}` } },
  });
}

beforeAll(async () => {
  [ana, ben, cy] = [await person("ana"), await person("ben"), await person("cy")];
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("POST and GET /api/trades/:id/messages", () => {
  it("sends and lists messages from each person's side, newest first", async () => {
    const tradeId = await newTrade();
    const sent = await send(ana, tradeId, { body: "  Is the wheel still available?  " });
    expect(sent.status).toBe(201);
    expect(messageSchema.parse(sent.body.data)).toMatchObject({
      type: "text",
      from: "me",
      body: "Is the wheel still available?",
      asksForContact: false,
    });
    await send(ben, tradeId, { body: "Yes! Add me on viber" });

    const page = pageSchema(messageSchema).parse((await list(ben, tradeId)).body.data);
    expect(texts(page.items).map((m) => [m.from, m.body, m.asksForContact])).toEqual([
      ["me", "Yes! Add me on viber", true],
      ["them", "Is the wheel still available?", false],
    ]);
  });

  it("pages back in time without repeats", async () => {
    const tradeId = await newTrade();
    for (const body of ["one", "two", "three"]) await send(ana, tradeId, { body });

    const seen: string[] = [];
    let cursor = "";
    for (let i = 0; i < 5; i++) {
      const page = pageSchema(messageSchema).parse(
        (await list(ana, tradeId, `?limit=2${cursor && `&cursor=${cursor}`}`)).body.data,
      );
      seen.push(...page.items.map((m) => (m.type === "text" ? m.body : m.type)));
      if (!page.nextCursor) break;
      cursor = page.nextCursor;
    }
    // The offer card from proposing is the oldest, so it comes last.
    expect(seen).toEqual(["three", "two", "one", "offer"]);
  });

  it("hides the chat from everyone else and checks the body", async () => {
    const tradeId = await newTrade();
    expect((await send(cy, tradeId, { body: "hi" })).body.error.code).toBe("TRADE_NOT_FOUND");
    expect((await list(cy, tradeId)).status).toBe(404);
    expect((await list(null, tradeId)).status).toBe(401);
    expect((await send(null, tradeId, { body: "hi" })).status).toBe(401);
    expect((await send(ana, tradeId, { body: "   " })).body.error.code).toBe("VALIDATION_FAILED");
    expect((await send(ana, tradeId, { body: "x".repeat(1001) })).status).toBe(400);
  });

  it("keeps a closed trade's chat read only", async () => {
    const tradeId = await newTrade();
    await send(ana, tradeId, { body: "Before" });
    await decline(sql, tradeId, ben.id);

    const res = await send(ana, tradeId, { body: "After" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("TRADE_NOT_PENDING");
    expect(texts((await list(ben, tradeId)).body.data.items)).toHaveLength(1);
  });
});

describe("offer cards and system lines (migration 0019)", () => {
  // The chat oldest first, as the app shows it, in a short form.
  async function story(as: Person, tradeId: string) {
    const page = pageSchema(messageSchema).parse((await list(as, tradeId, "?limit=50")).body.data);
    return page.items.reverse().map((m) => (m.type === "system" ? m.body : `${m.type} from ${m.from}`));
  }

  it("tells the whole trade in the chat", async () => {
    const tradeId = await newTrade();
    await counter(sql, tradeId, ben.id, [await newItem(sql, ben.id, category)], [await newItem(sql, ana.id, category)]);
    await accept(sql, tradeId, ana.id);
    await complete(sql, tradeId, ana.id);
    await complete(sql, tradeId, ben.id);

    expect(await story(ana, tradeId)).toEqual([
      "offer from me",
      "offer from them",
      "Offer accepted! The items are reserved. Set up a meetup next.",
      "Trade completed! Don't forget to rate each other.",
    ]);
    // Offer cards point at real offers of this trade.
    const page = pageSchema(messageSchema).parse((await list(ben, tradeId)).body.data);
    const cards = page.items.filter((m) => m.type === "offer");
    const offers = await sql`select id from public.trade_offers where trade_id = ${tradeId}`;
    expect(cards.map((c) => c.offerId).sort()).toEqual(offers.map((o) => o.id).sort());
  });

  it("explains why a trade ended", async () => {
    const declined = await newTrade();
    await decline(sql, declined, ben.id);
    expect((await story(ben, declined)).at(-1)).toBe("Offer declined.");

    const noShow = await newTrade();
    await accept(sql, noShow, ben.id);
    await cancel(sql, noShow, ana.id, "no_show");
    expect((await story(ben, noShow)).at(-1)).toBe("Trade cancelled: someone didn't show up.");

    const lostItem = await newTrade();
    const [line] = await sql`
      select toi.item_id from public.trade_offer_items toi
      join public.trades t on t.current_offer_id = toi.offer_id
      where t.id = ${lostItem} and toi.side = 'initiator'`;
    await sql`delete from public.items where id = ${line.item_id}`;
    expect((await story(ana, lostItem)).at(-1)).toBe("Trade cancelled: an item is no longer available.");
  });
});

describe("reading messages straight from Supabase (RLS, TRD section 12)", () => {
  it("lets only the two people in the trade read its messages", async () => {
    const tradeId = await newTrade();
    await send(ana, tradeId, { body: "Only for Ben" });

    const read = (client: ReturnType<typeof anonClient>) =>
      client.from("messages").select("body").eq("trade_id", tradeId).eq("type", "text");

    expect((await read(supabaseAs(ana))).data).toEqual([{ body: "Only for Ben" }]);
    expect((await read(supabaseAs(ben))).data).toEqual([{ body: "Only for Ben" }]);
    expect((await read(supabaseAs(cy))).data).toEqual([]);
    expect((await read(anonClient())).data ?? []).toEqual([]);
  });

  it("never lets anyone write directly", async () => {
    const tradeId = await newTrade();
    const insert = await supabaseAs(ana).from("messages").insert({ trade_id: tradeId, sender_id: ana.id, type: "text", body: "sneaky" });
    expect(insert.error).not.toBeNull();
    const [count] = await sql`
      select count(*)::int as n from public.messages where trade_id = ${tradeId} and type = 'text'`;
    expect(count.n).toBe(0);
  });

  it("is published to Realtime", async () => {
    const rows = await sql`
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'`;
    expect(rows).toHaveLength(1);
  });

  it("keeps each message type's shape", async () => {
    const tradeId = await newTrade();
    await expect(
      sql`insert into public.messages (trade_id, type) values (${tradeId}, 'text')`,
    ).rejects.toThrow(/ck_messages_shape/);
    await expect(
      sql`insert into public.messages (trade_id, type, body) values (${tradeId}, 'offer', 'x')`,
    ).rejects.toThrow(/ck_messages_shape/);
  });
});
