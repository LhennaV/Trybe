import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as getCategories } from "@/app/api/categories/route";
import { DELETE as deleteItemRoute, PATCH as patchItem } from "@/app/api/items/[id]/route";
import { POST as postItem } from "@/app/api/items/route";
import { GET as getMyItems } from "@/app/api/me/items/route";
import { POST as postPhoto } from "@/app/api/photos/route";
import { itemSchema } from "@/shared/contracts/items";
import { PHOTO_FIELD } from "@/shared/contracts/photos";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// Photos, categories, and items (ITEM-01 to ITEM-05) through the real routes,
// database, and storage.
const sql = testSql();
const created: string[] = [];
let token: string;
let otherToken: string;
let wheelsId: string;

const itemParams = (id: string) => ({ params: Promise.resolve({ id }) });

async function uploadPhoto(as = token) {
  const jpeg = await sharp({ create: { width: 2400, height: 1800, channels: 3, background: { r: 90, g: 60, b: 30 } } })
    .jpeg()
    .toBuffer();
  const form = new FormData();
  form.append(PHOTO_FIELD, new File([new Uint8Array(jpeg)], "p.jpg", { type: "image/jpeg" }));
  const response = await postPhoto(
    new Request("http://localhost/api/photos", { method: "POST", headers: { authorization: `Bearer ${as}` }, body: form }),
    undefined,
  );
  return readJson(response);
}

async function addItem(body: Record<string, unknown>, as = token) {
  return readJson(await postItem(apiRequest("/api/items", { method: "POST", token: as, body }), undefined));
}

async function newItem(name: string, extra: Record<string, unknown> = {}) {
  const photo = (await uploadPhoto()).body.data;
  const { body } = await addItem({ name, categoryId: wheelsId, condition: "good", photoIds: [photo.id], ...extra });
  return body.data;
}

beforeAll(async () => {
  const me = await createUser({ label: "items" });
  const other = await createUser({ label: "other" });
  created.push(me.id, other.id);
  token = await accessToken(me.email);
  otherToken = await accessToken(other.email);
  const [wheels] = await sql`
    select c.id from public.categories c join public.hobbies h on h.id = c.hobby_id
    where h.slug = 'pottery' and c.slug = 'wheels-kilns'`;
  wheelsId = wheels.id;
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("POST /api/photos", () => {
  it("stores a full size and a thumbnail and returns their URLs", async () => {
    const { status, body } = await uploadPhoto();
    expect(status).toBe(201);
    expect(body.data).toMatchObject({ width: 1600, height: 1200 });
    expect((await fetch(body.data.url)).status).toBe(200);
    const thumb = await sharp(Buffer.from(await (await fetch(body.data.thumbUrl)).arrayBuffer())).metadata();
    expect(thumb.width).toBe(400);
  });

  it("needs a verified email (AUTH-05)", async () => {
    const unverified = await createUser({ label: "unv", verified: false });
    created.push(unverified.id);
    // An unverified account can't sign in to get a token, so use its id via a
    // verified-then-unverified flip: sign in first, then clear verification.
    await sql`update auth.users set email_confirmed_at = now() where id = ${unverified.id}`;
    const unverifiedToken = await accessToken(unverified.email);
    await sql`update auth.users set email_confirmed_at = null where id = ${unverified.id}`;

    const { status, body } = await uploadPhoto(unverifiedToken);
    expect(status).toBe(403);
    expect(body.error.code).toBe("EMAIL_NOT_VERIFIED");
  });
});

describe("GET /api/categories", () => {
  it("lists one hobby's categories in order, Other last", async () => {
    const { body } = await readJson(await getCategories(apiRequest("/api/categories?hobby=pottery"), undefined));
    expect(body.data.map((c: { name: string }) => c.name)).toEqual(["Wheels & kilns", "Hand tools", "Clay & glaze", "Other"]);
  });

  it("lists every category without a hobby, and none for an unknown one", async () => {
    const all = await readJson(await getCategories(apiRequest("/api/categories"), undefined));
    expect(all.body.data).toHaveLength(74);
    const none = await readJson(await getCategories(apiRequest("/api/categories?hobby=knitting"), undefined));
    expect(none.body.data).toEqual([]);
  });
});

describe("POST /api/items", () => {
  it("adds gear with its photos (ITEM-01, ITEM-02)", async () => {
    const photo = (await uploadPhoto()).body.data;
    const { status, body } = await addItem({
      name: "Shimpo Aspire wheel",
      categoryId: wheelsId,
      condition: "good",
      photoIds: [photo.id],
      upForTrade: true,
      lookingFor: "Film camera",
    });
    expect(status).toBe(201);
    expect(itemSchema.parse(body.data)).toMatchObject({
      name: "Shimpo Aspire wheel",
      status: "available",
      upForTrade: true,
      lookingFor: "Film camera",
      category: { name: "Wheels & kilns" },
      photos: [{ id: photo.id }],
    });
  });

  it("refuses photos already used, someone else's photos, and unknown categories", async () => {
    const item = await newItem("First");
    const reused = await addItem({ name: "Second", categoryId: wheelsId, condition: "good", photoIds: [item.photos[0].id] });
    expect(reused.status).toBe(400);
    expect(reused.body.error.fields).toHaveProperty("photoIds");

    const theirs = (await uploadPhoto(otherToken)).body.data;
    const stolen = await addItem({ name: "Mine?", categoryId: wheelsId, condition: "good", photoIds: [theirs.id] });
    expect(stolen.status).toBe(400);

    const mine = (await uploadPhoto()).body.data;
    const badCategory = await addItem({
      name: "X",
      categoryId: "00000000-0000-4000-8000-000000000000",
      condition: "good",
      photoIds: [mine.id],
    });
    expect(badCategory.status).toBe(400);
    expect(badCategory.body.error.fields).toHaveProperty("categoryId");
  });
});

describe("GET /api/me/items", () => {
  it("pages newest first with no repeats, and filters by status", async () => {
    const pager = await createUser({ label: "pager" });
    created.push(pager.id);
    const pagerToken = await accessToken(pager.email);
    for (const name of ["One", "Two", "Three"]) {
      const photo = (await uploadPhoto(pagerToken)).body.data;
      await addItem({ name, categoryId: wheelsId, condition: "fair", photoIds: [photo.id] }, pagerToken);
    }

    const first = await readJson(await getMyItems(apiRequest("/api/me/items?limit=2", { token: pagerToken }), undefined));
    expect(first.body.data.items.map((i: { name: string }) => i.name)).toEqual(["Three", "Two"]);
    expect(first.body.data.nextCursor).toEqual(expect.any(String));

    const second = await readJson(
      await getMyItems(
        apiRequest(`/api/me/items?limit=2&cursor=${first.body.data.nextCursor}`, { token: pagerToken }),
        undefined,
      ),
    );
    expect(second.body.data.items.map((i: { name: string }) => i.name)).toEqual(["One"]);
    expect(second.body.data.nextCursor).toBeNull();

    const reserved = await readJson(
      await getMyItems(apiRequest("/api/me/items?status=reserved", { token: pagerToken }), undefined),
    );
    expect(reserved.body.data.items).toEqual([]);
  });

  it("refuses a broken cursor", async () => {
    const response = await getMyItems(apiRequest("/api/me/items?cursor=nope", { token }), undefined);
    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/items/:id", () => {
  it("changes only the fields sent (a rename keeps it up for trade)", async () => {
    const item = await newItem("Before", { upForTrade: true, lookingFor: "Anything" });
    const { status, body } = await readJson(
      await patchItem(apiRequest(`/api/items/${item.id}`, { method: "PATCH", token, body: { name: "After" } }), itemParams(item.id)),
    );
    expect(status).toBe(200);
    expect(body.data).toMatchObject({ name: "After", upForTrade: true, lookingFor: "Anything" });
  });

  it("replaces photos and deletes the ones no longer used", async () => {
    const item = await newItem("Photo swap");
    const oldPhoto = item.photos[0];
    const newPhoto = (await uploadPhoto()).body.data;

    const { body } = await readJson(
      await patchItem(
        apiRequest(`/api/items/${item.id}`, { method: "PATCH", token, body: { photoIds: [newPhoto.id] } }),
        itemParams(item.id),
      ),
    );
    expect(body.data.photos.map((p: { id: string }) => p.id)).toEqual([newPhoto.id]);
    expect((await fetch(oldPhoto.url)).ok).toBe(false);
    const [row] = await sql`select count(*)::int as n from public.photos where id = ${oldPhoto.id}`;
    expect(row.n).toBe(0);
  });

  it("refuses someone else's item and items in a trade (ITEM-04, ITEM-05)", async () => {
    const item = await newItem("Mine");
    const notYours = await patchItem(
      apiRequest(`/api/items/${item.id}`, { method: "PATCH", token: otherToken, body: { name: "Theirs" } }),
      itemParams(item.id),
    );
    expect((await readJson(notYours)).body.error.code).toBe("ITEM_NOT_OWNED");

    await sql`update public.items set status = 'reserved' where id = ${item.id}`;
    const inTrade = await patchItem(
      apiRequest(`/api/items/${item.id}`, { method: "PATCH", token, body: { name: "Changed" } }),
      itemParams(item.id),
    );
    expect(inTrade.status).toBe(409);
    expect((await readJson(inTrade)).body.error.code).toBe("ITEM_NOT_AVAILABLE");
  });
});

describe("DELETE /api/items/:id", () => {
  it("removes the item and its photo files", async () => {
    const item = await newItem("Going away");
    const response = await deleteItemRoute(apiRequest(`/api/items/${item.id}`, { method: "DELETE", token }), itemParams(item.id));
    expect(response.status).toBe(200);

    const [row] = await sql`select count(*)::int as n from public.items where id = ${item.id}`;
    expect(row.n).toBe(0);
    expect((await fetch(item.photos[0].url)).ok).toBe(false);
  });

  it("answers 404 for unknown or malformed ids", async () => {
    for (const id of ["00000000-0000-4000-8000-000000000000", "not-an-id"]) {
      const response = await deleteItemRoute(apiRequest(`/api/items/${id}`, { method: "DELETE", token }), itemParams(id));
      expect(response.status, id).toBe(404);
    }
  });
});
