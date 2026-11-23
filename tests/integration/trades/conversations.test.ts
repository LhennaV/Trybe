import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as acceptRoute } from "@/app/api/conversations/[id]/accept/route";
import { POST as declineRoute } from "@/app/api/conversations/[id]/decline/route";
import { GET as messagesRoute, POST as sendRoute } from "@/app/api/conversations/[id]/messages/route";
import { GET as listRoute, POST as startRoute } from "@/app/api/conversations/route";
import { pageSchema } from "@/shared/contracts/common";
import { conversationSchema, startConversationResultSchema } from "@/shared/contracts/conversations";
import { messageSchema } from "@/shared/contracts/trades";
import { accept, categoryId, complete, newItem, propose } from "../db/tradeHelpers";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// Direct messages and message requests (migrations 0022 and 0023, CHAT-02,
// CHAT-06, decided 2026-11-23).
const sql = testSql();
const created: string[] = [];
type Person = { id: string; token: string; handle: string };
let category: string;

async function person(label: string): Promise<Person> {
  const user = await createUser({ label });
  created.push(user.id);
  return { id: user.id, handle: user.handle, token: await accessToken(user.email) };
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (path: string, as: Person, body?: unknown) => apiRequest(path, { method: "POST", token: as.token, body });

async function start(as: Person, to: Person, body = "Hi! Is the hook set still up for trade?") {
  return readJson(await startRoute(post("/api/conversations", as, { handle: to.handle, body }), undefined));
}
async function reply(as: Person, id: string, body: string) {
  return readJson(await sendRoute(post(`/api/conversations/${id}/messages`, as, { body }), params(id)));
}
async function answer(as: Person, id: string, how: "accept" | "decline") {
  const route = how === "accept" ? acceptRoute : declineRoute;
  return readJson(await route(post(`/api/conversations/${id}/${how}`, as), params(id)));
}
async function box(as: Person, which: "chats" | "requests") {
  const res = await readJson(await listRoute(apiRequest(`/api/conversations?box=${which}`, { token: as.token }), undefined));
  return pageSchema(conversationSchema).parse(res.body.data).items;
}
async function history(as: Person, id: string) {
  const res = await readJson(await messagesRoute(apiRequest(`/api/conversations/${id}/messages`, { token: as.token }), params(id)));
  return res.status === 200 ? pageSchema(messageSchema).parse(res.body.data).items : res;
}

// A completed trade between two people.
async function completedTrade(a: Person, b: Person) {
  const tradeId = await propose(sql, a.id, [await newItem(sql, a.id, category)], [await newItem(sql, b.id, category)]);
  await accept(sql, tradeId, b.id);
  await complete(sql, tradeId, a.id);
  await complete(sql, tradeId, b.id);
}

beforeAll(async () => {
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("message requests", () => {
  it("sends a first message to a stranger as a request, one message until they answer", async () => {
    const [mika, lhen] = [await person("mika"), await person("lhen")];
    const started = await start(mika, lhen);
    expect(started.status).toBe(201);
    const { conversation, message } = startConversationResultSchema.parse(started.body.data);
    expect(conversation.state).toBe("waiting");
    expect(message).toMatchObject({ type: "text", from: "me", asksForContact: false });

    // One message only while waiting, through either endpoint.
    expect((await start(mika, lhen, "Hello??")).body.error.code).toBe("CONFLICT");
    expect((await reply(mika, conversation.id, "Hello??")).status).toBe(409);

    // It sits in Lhen's Requests, and in Mika's Chats as waiting.
    const requests = await box(lhen, "requests");
    expect(requests.map((c) => [c.id, c.state, c.other.handle])).toEqual([[conversation.id, "request", mika.handle]]);
    expect((await box(lhen, "chats")).map((c) => c.id)).not.toContain(conversation.id);
    expect((await box(mika, "chats")).find((c) => c.id === conversation.id)?.state).toBe("waiting");
  });

  it("opens with Accept chat, or simply by replying", async () => {
    const [a, b, c] = [await person("rqa"), await person("rqb"), await person("rqc")];

    const first = startConversationResultSchema.parse((await start(a, b)).body.data).conversation;
    const accepted = await answer(b, first.id, "accept");
    expect(accepted.body.data.state).toBe("open");
    expect((await reply(a, first.id, "Thanks!")).status).toBe(201);

    const second = startConversationResultSchema.parse((await start(c, b)).body.data).conversation;
    expect((await reply(b, second.id, "Hi! Yes it is.")).status).toBe(201);
    expect((await box(c, "chats")).find((x) => x.id === second.id)?.state).toBe("open");
    expect(await box(b, "requests")).toEqual([]);
  });

  it("declines quietly, and lets them ask again after 7 days", async () => {
    const [asker, busy] = [await person("asker"), await person("busy")];
    const { id } = startConversationResultSchema.parse((await start(asker, busy)).body.data).conversation;

    expect((await answer(busy, id, "decline")).status).toBe(200);
    // The asker still just sees "waiting", and can't send more yet.
    expect((await box(asker, "chats")).find((c) => c.id === id)?.state).toBe("waiting");
    expect((await start(asker, busy, "Again?")).body.error.code).toBe("CONFLICT");
    expect(await box(busy, "requests")).toEqual([]);

    await sql`update public.conversations set requested_at = now() - interval '8 days' where id = ${id}`;
    expect((await start(asker, busy, "Trying again")).status).toBe(201);
    expect((await box(busy, "requests")).map((c) => c.id)).toEqual([id]);
  });

  it("only the person asked can answer, and only a waiting request", async () => {
    const [a, b] = [await person("ansa"), await person("ansb")];
    const { id } = startConversationResultSchema.parse((await start(a, b)).body.data).conversation;
    expect((await answer(a, id, "accept")).body.error.code).toBe("FORBIDDEN");
    await answer(b, id, "accept");
    expect((await answer(b, id, "decline")).body.error.code).toBe("CONFLICT");
  });
});

describe("people who traded together, and traded-only (CHAT-06)", () => {
  it("opens straight away after a completed trade", async () => {
    const [a, b] = [await person("pala"), await person("palb")];
    await completedTrade(a, b);
    const { conversation } = startConversationResultSchema.parse((await start(a, b)).body.data);
    expect(conversation.state).toBe("open");
    expect(await box(b, "requests")).toEqual([]);
  });

  it("refuses strangers when someone takes messages only from traders", async () => {
    const [stranger, picky, friend] = [await person("strng"), await person("picky"), await person("frnd")];
    await sql`update public.users set message_permission = 'traded_only' where id = ${picky.id}`;

    const refused = await start(stranger, picky);
    expect(refused.status).toBe(403);
    expect(refused.body.error.code).toBe("FORBIDDEN");
    const [left] = await sql`
      select count(*)::int as n from public.conversations where ${stranger.id} in (user_a_id, user_b_id)`;
    expect(left.n).toBe(0);

    await completedTrade(friend, picky);
    expect((await start(friend, picky)).status).toBe(201);
  });
});

describe("privacy and checks", () => {
  it("keeps a conversation to its two people, including on Supabase directly", async () => {
    const [a, b, outsider] = [await person("prva"), await person("prvb"), await person("prvo")];
    const { conversation } = startConversationResultSchema.parse((await start(a, b, "Just us")).body.data);

    expect(await history(b, conversation.id)).toMatchObject([{ type: "text", from: "them", body: "Just us" }]);
    const hidden = await history(outsider, conversation.id);
    expect(hidden).toMatchObject({ status: 404 });
    expect((await reply(outsider, conversation.id, "hi")).status).toBe(404);

    const read = (who: Person) =>
      createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { Authorization: `Bearer ${who.token}` } },
      })
        .from("messages")
        .select("body")
        .eq("conversation_id", conversation.id);
    expect((await read(b)).data).toEqual([{ body: "Just us" }]);
    expect((await read(outsider)).data).toEqual([]);
  });

  it("checks the handle, the body, and messaging yourself", async () => {
    const me = await person("self");
    expect((await start(me, me)).body.error.code).toBe("VALIDATION_FAILED");
    expect(
      (await readJson(await startRoute(post("/api/conversations", me, { handle: "nobody_here_x", body: "hi" }), undefined)))
        .status,
    ).toBe(404);
    const other = await person("other");
    expect((await start(me, other, "   ")).status).toBe(400);
    expect(startConversationResultSchema.parse((await start(me, other, "ano number mo?")).body.data).message).toMatchObject({
      asksForContact: true,
    });
  });

  it("keeps one conversation per pair, even when both start at once", async () => {
    const [a, b] = [await person("racea"), await person("raceb")];
    const results = await Promise.all([start(a, b, "Hi from A"), start(b, a, "Hi from B")]);
    expect(results.every((r) => r.status === 201)).toBe(true);
    const ids = results.map((r) => r.body.data.conversation.id);
    expect(ids[0]).toBe(ids[1]);
    // The second one answered the first, so it's open.
    expect((await box(a, "chats")).find((c) => c.id === ids[0])?.state).toBe("open");
  });
});
