import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as acceptRoute } from "@/app/api/trades/[id]/accept/route";
import { POST as cancelRoute } from "@/app/api/trades/[id]/cancel/route";
import { POST as counterRoute } from "@/app/api/trades/[id]/counter/route";
import { POST as declineRoute } from "@/app/api/trades/[id]/decline/route";
import { GET as detailRoute } from "@/app/api/trades/[id]/route";
import { GET as listRoute, POST as proposeRoute } from "@/app/api/trades/route";
import { pageSchema } from "@/shared/contracts/common";
import { tradeDetailSchema, tradeSummarySchema } from "@/shared/contracts/trades";
import { categoryId, newItem } from "../db/tradeHelpers";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// The trade endpoints (TRD section 10). The rules themselves are tested
// against the database functions (tests/integration/db/trade-functions.test.ts);
// these check the HTTP side: auth, status codes, and the viewer-relative
// responses ("me" and "them").
const sql = testSql();
const created: string[] = [];
type Person = { id: string; token: string; handle: string };
let ana: Person;
let ben: Person;
let cy: Person;
let category: string;
let photoCount = 0;

async function person(label: string): Promise<Person> {
  const user = await createUser({ label });
  created.push(user.id);
  return { id: user.id, handle: user.handle, token: await accessToken(user.email) };
}

// Gear with a cover photo, so thumbUrl has something to show.
async function gear(owner: Person, name: string) {
  const id = await newItem(sql, owner.id, category, { name });
  photoCount += 1;
  const [photo] = await sql`
    insert into public.photos (owner_id, path, thumb_path, width, height)
    values (${owner.id}, ${`test/${owner.id}/${photoCount}.webp`}, ${`test/${owner.id}/${photoCount}-t.webp`}, 1200, 1600)
    returning id`;
  await sql`insert into public.item_photos (item_id, photo_id, position) values (${id}, ${photo.id}, 0)`;
  return id;
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (path: string, as: Person, body?: unknown) => apiRequest(path, { method: "POST", token: as.token, body });

async function propose(as: Person, body: unknown) {
  return readJson(await proposeRoute(post("/api/trades", as, body), undefined));
}
async function detail(as: Person | null, id: string) {
  return readJson(await detailRoute(apiRequest(`/api/trades/${id}`, { token: as?.token }), params(id)));
}
async function list(as: Person | null, query = "") {
  return readJson(await listRoute(apiRequest(`/api/trades${query}`, { token: as?.token }), undefined));
}
type Route = (request: Request, ctx: ReturnType<typeof params>) => Promise<Response>;
async function act(route: Route, action: string, as: Person, id: string, body?: unknown) {
  return readJson(await route(post(`/api/trades/${id}/${action}`, as, body), params(id)));
}

// Ana offers her camera for Ben's wheel.
async function anaProposes(cash?: { amount: number; from: "me" | "them" }) {
  const give = await gear(ana, "Canon AE-1");
  const want = await gear(ben, "Shimpo wheel");
  const res = await propose(ana, { giveItemIds: [give], wantItemIds: [want], ...(cash && { cash }) });
  expect(res.status).toBe(201);
  return { id: res.body.data.id as string, give, want };
}

beforeAll(async () => {
  [ana, ben, cy] = [await person("ana"), await person("ben"), await person("cy")];
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("POST /api/trades", () => {
  it("creates the trade and answers from the proposer's side", async () => {
    const { id, give, want } = await anaProposes({ amount: 300, from: "me" });
    const { body } = await detail(ana, id);
    const trade = tradeDetailSchema.parse(body.data);

    expect(trade.status).toBe("pending");
    expect(trade.other?.handle).toBe(ben.handle);
    expect(trade.canRespond).toBe(false); // Ana made the offer, so she waits (TRD-05)
    expect(trade.currentOffer.madeBy).toBe("me");
    expect(trade.currentOffer.myItems.map((i) => i.id)).toEqual([give]);
    expect(trade.currentOffer.theirItems.map((i) => i.id)).toEqual([want]);
    expect(trade.currentOffer.myItems[0].thumbUrl).toMatch(/-t\.webp$/);
    expect(trade.currentOffer.cash).toEqual({ amount: 300, from: "me" });
    expect(trade.offers).toHaveLength(1);
  });

  it("checks the body and who is asking", async () => {
    const want = await gear(ben, "Glaze kit");
    expect((await propose(ana, { giveItemIds: [], wantItemIds: [want] })).body.error.code).toBe("VALIDATION_FAILED");
    expect((await propose(ana, { giveItemIds: [want], wantItemIds: [want], extra: 1 })).status).toBe(400);
    expect((await propose(ana, { giveItemIds: [await gear(ben, "Not mine")], wantItemIds: [want] })).body.error.code).toBe(
      "ITEM_NOT_OWNED",
    );
    const anonymous = await proposeRoute(
      apiRequest("/api/trades", { method: "POST", body: { giveItemIds: [want], wantItemIds: [want] } }),
      undefined,
    );
    expect(anonymous.status).toBe(401);
  });
});

describe("GET /api/trades and /api/trades/:id", () => {
  it("shows the same trade from the other side", async () => {
    const { id, give, want } = await anaProposes({ amount: 300, from: "me" });
    const { body } = await detail(ben, id);
    const trade = tradeDetailSchema.parse(body.data);

    expect(trade.other?.handle).toBe(ana.handle);
    expect(trade.canRespond).toBe(true);
    expect(trade.currentOffer.madeBy).toBe("them");
    expect(trade.currentOffer.myItems.map((i) => i.id)).toEqual([want]);
    expect(trade.currentOffer.theirItems.map((i) => i.id)).toEqual([give]);
    expect(trade.currentOffer.cash).toEqual({ amount: 300, from: "them" });
  });

  it("hides a trade from everyone else, and needs a login", async () => {
    const { id } = await anaProposes();
    const outsider = await detail(cy, id);
    expect(outsider.status).toBe(404);
    expect(outsider.body.error.code).toBe("TRADE_NOT_FOUND");
    expect((await detail(cy, "not-a-uuid")).status).toBe(404);
    expect((await detail(null, id)).status).toBe(401);
    expect((await list(null)).status).toBe(401);
    expect((await list(cy)).body.data.items.map((t: { id: string }) => t.id)).not.toContain(id);
  });

  it("lists my trades, filtered and paged without repeats", async () => {
    const lister = await person("lister");
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const res = await propose(lister, { giveItemIds: [await gear(lister, `Mine ${i}`)], wantItemIds: [await gear(ben, `Theirs ${i}`)] });
      ids.push(res.body.data.id);
    }
    await act(declineRoute, "decline", ben, ids[0]);

    const pending = await list(lister, "?status=pending");
    expect(pending.body.data.items.map((t: { id: string }) => t.id).sort()).toEqual([ids[1], ids[2]].sort());

    const seen: string[] = [];
    let cursor = "";
    for (let page = 0; page < 5; page++) {
      const res = await list(lister, `?limit=1${cursor && `&cursor=${cursor}`}`);
      const parsed = pageSchema(tradeSummarySchema).parse(res.body.data);
      seen.push(...parsed.items.map((t) => t.id));
      if (!parsed.nextCursor) break;
      cursor = parsed.nextCursor;
    }
    // Most recently changed first: declining made the first one the newest.
    expect(seen).toEqual([ids[0], ids[2], ids[1]]);
  });
});

describe("counter, accept, decline, cancel", () => {
  it("runs a full negotiation", async () => {
    const { id } = await anaProposes();

    // Ana can't answer her own offer (TRD-04).
    const own = await act(acceptRoute, "accept", ana, id);
    expect(own.status).toBe(403);
    expect(own.body.error.code).toBe("CANNOT_ACCEPT_OWN_OFFER");

    // Ben counters: he asks for a different item and adds cash.
    const countered = await act(counterRoute, "counter", ben, id, {
      giveItemIds: [await gear(ben, "Trimming tools")],
      wantItemIds: [await gear(ana, "Light meter")],
      cash: { amount: 150, from: "me" },
    });
    expect(countered.status).toBe(200);
    const afterCounter = tradeDetailSchema.parse(countered.body.data);
    expect(afterCounter.status).toBe("pending");
    expect(afterCounter.offers).toHaveLength(2);
    expect(afterCounter.canRespond).toBe(false);
    expect(afterCounter.currentOffer.cash).toEqual({ amount: 150, from: "me" });

    // Now Ana answers.
    const accepted = await act(acceptRoute, "accept", ana, id);
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.status).toBe("accepted");

    const again = await act(acceptRoute, "accept", ana, id);
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe("TRADE_NOT_PENDING");

    const cancelled = await act(cancelRoute, "cancel", ben, id, { reason: "no_show" });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data).toMatchObject({ status: "cancelled", cancelledBy: "me", cancelReason: "no_show" });
    expect((await detail(ana, id)).body.data.cancelledBy).toBe("them");
  });

  it("declines, and refuses a cancel reason only the server sets", async () => {
    const { id } = await anaProposes();
    expect((await act(cancelRoute, "cancel", ana, id, { reason: "item_unavailable" })).status).toBe(400);
    const declined = await act(declineRoute, "decline", ben, id);
    expect(declined.body.data.status).toBe("declined");
    expect((await act(declineRoute, "decline", cy, id)).body.error.code).toBe("NOT_TRADE_MEMBER");
  });
});

describe("after deletes (decided 2026-11-17)", () => {
  it("keeps a deleted item's name in the offer", async () => {
    const { id, give } = await anaProposes();
    await sql`delete from public.items where id = ${give}`;

    const trade = tradeDetailSchema.parse((await detail(ben, id)).body.data);
    expect(trade).toMatchObject({ status: "cancelled", cancelReason: "item_unavailable", cancelledBy: null });
    expect(trade.currentOffer.theirItems).toEqual([{ id: null, name: "Canon AE-1", condition: null, thumbUrl: null }]);
  });

  it("shows a deleted account as no one", async () => {
    const leaver = await person("leaver");
    const res = await propose(leaver, {
      giveItemIds: [await gear(leaver, "Old kiln")],
      wantItemIds: [await gear(ben, "Banding wheel")],
    });
    await deleteUsers([leaver.id]);

    const trade = tradeDetailSchema.parse((await detail(ben, res.body.data.id)).body.data);
    expect(trade.other).toBeNull();
    expect(trade.currentOffer.madeBy).toBe("them");
  });
});
