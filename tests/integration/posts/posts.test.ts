import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as getFeed } from "@/app/api/feed/route";
import { PATCH as patchItem } from "@/app/api/items/[id]/route";
import { POST as postItem } from "@/app/api/items/route";
import { POST as postPhoto } from "@/app/api/photos/route";
import { DELETE as unlike, POST as like } from "@/app/api/posts/[id]/like/route";
import { DELETE as deletePostRoute, GET as getPost, PATCH as patchPost } from "@/app/api/posts/[id]/route";
import { DELETE as unsave, POST as save } from "@/app/api/posts/[id]/save/route";
import { POST as createPostRoute } from "@/app/api/posts/route";
import { PHOTO_FIELD } from "@/shared/contracts/photos";
import { postCardSchema, postDetailSchema } from "@/shared/contracts/posts";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// Posts, the feed, likes, and saves (POST-01 to POST-07, POST-09) through the
// real routes, database, and storage.
const sql = testSql();
const created: string[] = [];
let token: string;
let otherToken: string;
let hobby: { pottery: string; guitar: string };
let wheelsId: string;

const params = (id: string) => ({ params: Promise.resolve({ id }) });

async function uploadPhoto(as = token): Promise<string> {
  const jpeg = await sharp({ create: { width: 900, height: 1200, channels: 3, background: { r: 40, g: 90, b: 140 } } })
    .jpeg()
    .toBuffer();
  const form = new FormData();
  form.append(PHOTO_FIELD, new File([new Uint8Array(jpeg)], "p.jpg", { type: "image/jpeg" }));
  const response = await postPhoto(
    new Request("http://localhost/api/photos", { method: "POST", headers: { authorization: `Bearer ${as}` }, body: form }),
    undefined,
  );
  return (await readJson(response)).body.data.id;
}

async function newItem(upForTrade: boolean, as = token): Promise<string> {
  const body = { name: "Wheel", categoryId: wheelsId, condition: "good", photoIds: [await uploadPhoto(as)], upForTrade };
  return (await readJson(await postItem(apiRequest("/api/items", { method: "POST", token: as, body }), undefined))).body.data
    .id;
}

async function newPost(extra: Record<string, unknown> = {}, as = token) {
  const body = { title: "Mug set", photoIds: [await uploadPhoto(as)], hobbyId: hobby.pottery, ...extra };
  return readJson(await createPostRoute(apiRequest("/api/posts", { method: "POST", token: as, body }), undefined));
}

async function feedPage(query: string, as?: string) {
  return (await readJson(await getFeed(apiRequest(`/api/feed?${query}`, { token: as }), undefined))).body.data;
}

beforeAll(async () => {
  const me = await createUser({ label: "poster" });
  const other = await createUser({ label: "reader" });
  created.push(me.id, other.id);
  token = await accessToken(me.email);
  otherToken = await accessToken(other.email);
  const rows = await sql`select id, slug from public.hobbies where slug in ('pottery', 'guitar')`;
  hobby = Object.fromEntries(rows.map((r) => [r.slug, r.id])) as typeof hobby;
  const [wheels] = await sql`
    select c.id from public.categories c where c.hobby_id = ${hobby.pottery} and c.slug = 'wheels-kilns'`;
  wheelsId = wheels.id;
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("POST /api/posts and GET /api/posts/:id", () => {
  it("creates a post with photos, one hobby, and tagged gear (POST-01)", async () => {
    const itemId = await newItem(true);
    const { status, body } = await newPost({ caption: "Finally centered", itemIds: [itemId] });
    expect(status).toBe(201);
    expect(postDetailSchema.parse(body.data)).toMatchObject({
      title: "Mug set",
      caption: "Finally centered",
      hobby: { slug: "pottery" },
      upForTrade: true,
      items: [{ id: itemId }],
    });
  });

  it("derives 'for trade' from the tagged gear, live (POST-02)", async () => {
    const itemId = await newItem(false);
    const post = (await newPost({ itemIds: [itemId] })).body.data;
    expect(post.upForTrade).toBe(false);

    await patchItem(apiRequest(`/api/items/${itemId}`, { method: "PATCH", token, body: { upForTrade: true } }), params(itemId));
    const after = (await readJson(await getPost(apiRequest(`/api/posts/${post.id}`), params(post.id)))).body.data;
    expect(after.upForTrade).toBe(true);

    // Reserved gear can't be traded again, so the post stops being for trade.
    await sql`update public.items set status = 'reserved' where id = ${itemId}`;
    const reserved = (await readJson(await getPost(apiRequest(`/api/posts/${post.id}`), params(post.id)))).body.data;
    expect(reserved.upForTrade).toBe(false);
  });

  it("refuses someone else's gear and unknown hobbies", async () => {
    const theirs = await newItem(true, otherToken);
    const tagged = await newPost({ itemIds: [theirs] });
    expect(tagged.status).toBe(403);
    expect(tagged.body.error.code).toBe("ITEM_NOT_OWNED");

    const badHobby = await newPost({ hobbyId: "00000000-0000-4000-8000-000000000000" });
    expect(badHobby.status).toBe(400);
    expect(badHobby.body.error.fields).toHaveProperty("hobbyId");
  });
});

describe("PATCH and DELETE /api/posts/:id (POST-09)", () => {
  it("changes only the fields sent", async () => {
    const itemId = await newItem(true);
    const post = (await newPost({ caption: "Keep me", itemIds: [itemId] })).body.data;
    const { body } = await readJson(
      await patchPost(apiRequest(`/api/posts/${post.id}`, { method: "PATCH", token, body: { title: "Renamed" } }), params(post.id)),
    );
    expect(body.data).toMatchObject({ title: "Renamed", caption: "Keep me", items: [{ id: itemId }] });
  });

  it("only lets the author change or delete it", async () => {
    const post = (await newPost()).body.data;
    const edit = await patchPost(
      apiRequest(`/api/posts/${post.id}`, { method: "PATCH", token: otherToken, body: { title: "Mine now" } }),
      params(post.id),
    );
    expect(edit.status).toBe(403);
    const remove = await deletePostRoute(apiRequest(`/api/posts/${post.id}`, { method: "DELETE", token: otherToken }), params(post.id));
    expect(remove.status).toBe(403);
  });

  it("deletes the post and its photo files, but keeps the tagged gear", async () => {
    const itemId = await newItem(true);
    const post = (await newPost({ itemIds: [itemId] })).body.data;
    const response = await deletePostRoute(apiRequest(`/api/posts/${post.id}`, { method: "DELETE", token }), params(post.id));
    expect(response.status).toBe(200);

    expect((await getPost(apiRequest(`/api/posts/${post.id}`), params(post.id))).status).toBe(404);
    expect((await fetch(post.cover.url)).ok).toBe(false);
    const [item] = await sql`select count(*)::int as n from public.items where id = ${itemId}`;
    expect(item.n).toBe(1);
  });
});

describe("GET /api/feed (POST-05)", () => {
  it("filters by hobby, newest first, with no repeats when new posts arrive", async () => {
    const ids: string[] = [];
    for (const title of ["Oldest", "Middle", "Newest"]) {
      ids.push((await newPost({ title, hobbyId: hobby.guitar })).body.data.id);
    }
    const mine = (cards: { id: string }[]) => cards.map((c) => c.id).filter((id) => ids.includes(id));

    const first = await feedPage("hobby=guitar&limit=2");
    for (const card of first.items) postCardSchema.parse(card);
    expect(mine(first.items)).toEqual([ids[2], ids[1]]);

    // A new post arrives at the top while someone is scrolling.
    ids.push((await newPost({ title: "Brand new", hobbyId: hobby.guitar })).body.data.id);

    const second = await feedPage(`hobby=guitar&limit=2&cursor=${first.nextCursor}`);
    const seen = [...first.items, ...second.items].map((c: { id: string }) => c.id);
    expect(new Set(seen).size).toBe(seen.length);
    expect(mine(second.items)).toContain(ids[0]);
    expect(mine(second.items)).not.toContain(ids[3]);
  });

  it("leaves out hidden posts and unknown hobbies", async () => {
    const post = (await newPost({ hobbyId: hobby.guitar })).body.data;
    await sql`update public.posts set hidden_at = now() where id = ${post.id}`;

    const feed = await feedPage("hobby=guitar&limit=50");
    expect(feed.items.map((c: { id: string }) => c.id)).not.toContain(post.id);
    expect((await getPost(apiRequest(`/api/posts/${post.id}`), params(post.id))).status).toBe(404);
    expect((await feedPage("hobby=knitting")).items).toEqual([]);
  });
});

describe("likes and saves (POST-06, POST-07)", () => {
  it("counts a like once, however many taps", async () => {
    const post = (await newPost()).body.data;
    const request = (as: string, method = "POST") =>
      apiRequest(`/api/posts/${post.id}/like`, { method, token: as });

    await like(request(otherToken), params(post.id));
    const twice = (await readJson(await like(request(otherToken), params(post.id)))).body.data;
    expect(twice).toEqual({ likedByMe: true, likeCount: 1 });

    const card = (await feedPage("hobby=pottery&limit=50", otherToken)).items.find((c: { id: string }) => c.id === post.id);
    expect(card).toMatchObject({ likedByMe: true, likeCount: 1 });

    const undone = (await readJson(await unlike(request(otherToken, "DELETE"), params(post.id)))).body.data;
    expect(undone).toEqual({ likedByMe: false, likeCount: 0 });
  });

  it("saves and unsaves", async () => {
    const post = (await newPost()).body.data;
    const request = (method: string) => apiRequest(`/api/posts/${post.id}/save`, { method, token: otherToken });
    expect((await readJson(await save(request("POST"), params(post.id)))).body.data).toEqual({ savedByMe: true });
    expect((await readJson(await unsave(request("DELETE"), params(post.id)))).body.data).toEqual({ savedByMe: false });
  });

  it("needs a session, and a post that exists", async () => {
    const post = (await newPost()).body.data;
    expect((await like(apiRequest(`/api/posts/${post.id}/like`, { method: "POST" }), params(post.id))).status).toBe(401);
    const missing = "00000000-0000-4000-8000-000000000000";
    expect((await like(apiRequest(`/api/posts/${missing}/like`, { method: "POST", token }), params(missing))).status).toBe(404);
  });

  it("shows nothing as liked or saved when logged out", async () => {
    const post = (await newPost()).body.data;
    await like(apiRequest(`/api/posts/${post.id}/like`, { method: "POST", token }), params(post.id));
    const anonymous = (await readJson(await getPost(apiRequest(`/api/posts/${post.id}`), params(post.id)))).body.data;
    expect(anonymous).toMatchObject({ likeCount: 1, likedByMe: false, savedByMe: false });
  });
});
