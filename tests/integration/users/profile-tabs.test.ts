import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as getUserItems } from "@/app/api/users/[handle]/items/route";
import { GET as getUserPosts } from "@/app/api/users/[handle]/posts/route";
import { itemSchema } from "@/shared/contracts/items";
import { postCardSchema } from "@/shared/contracts/posts";
import { apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// The profile's posts and gear tabs (PROF-03): public, paged, newest first,
// and only what anyone may see.
const sql = testSql();
const created: string[] = [];
let owner: Awaited<ReturnType<typeof createUser>>;
let potteryId: string;
let wheelsId: string;
let photoCount = 0;

const handleParams = (handle: string) => ({ params: Promise.resolve({ handle }) });

async function photo(ownerId: string) {
  photoCount += 1;
  const [row] = await sql`
    insert into public.photos (owner_id, path, thumb_path, width, height)
    values (${ownerId}, ${`test/${ownerId}/${photoCount}.webp`}, ${`test/${ownerId}/${photoCount}-t.webp`}, 1200, 1600)
    returning id`;
  return row.id as string;
}

async function post(ownerId: string, title: string) {
  const [row] = await sql`
    insert into public.posts (user_id, hobby_id, title) values (${ownerId}, ${potteryId}, ${title}) returning id`;
  await sql`insert into public.post_photos (post_id, photo_id, position) values (${row.id}, ${await photo(ownerId)}, 0)`;
  return row.id as string;
}

async function item(ownerId: string, name: string, upForTrade: boolean, status = "available") {
  const [row] = await sql`
    insert into public.items (owner_id, name, category_id, condition, up_for_trade, status)
    values (${ownerId}, ${name}, ${wheelsId}, 'good', ${upForTrade}, ${status})
    returning id`;
  await sql`insert into public.item_photos (item_id, photo_id, position) values (${row.id}, ${await photo(ownerId)}, 0)`;
  return row.id as string;
}

async function postsTab(handle: string, query = "") {
  return readJson(await getUserPosts(apiRequest(`/api/users/${handle}/posts${query}`), handleParams(handle)));
}

async function gearTab(handle: string, query = "") {
  return readJson(await getUserItems(apiRequest(`/api/users/${handle}/items${query}`), handleParams(handle)));
}

beforeAll(async () => {
  owner = await createUser({ label: "tabs" });
  created.push(owner.id);
  const [pottery] = await sql`select id from public.hobbies where slug = 'pottery'`;
  potteryId = pottery.id;
  const [wheels] = await sql`select id from public.categories where hobby_id = ${potteryId} and slug = 'wheels-kilns'`;
  wheelsId = wheels.id;
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("GET /api/users/:handle/posts", () => {
  it("lists one person's posts, newest first, paged without repeats", async () => {
    const ids = [await post(owner.id, "First"), await post(owner.id, "Second"), await post(owner.id, "Third")];
    const other = await createUser({ label: "notme" });
    created.push(other.id);
    await post(other.id, "Someone else's");

    const first = await postsTab(owner.handle, "?limit=2");
    expect(first.status).toBe(200);
    for (const card of first.body.data.items) postCardSchema.parse(card);
    expect(first.body.data.items.map((c: { id: string }) => c.id)).toEqual([ids[2], ids[1]]);

    const second = await postsTab(owner.handle, `?limit=2&cursor=${first.body.data.nextCursor}`);
    expect(second.body.data.items.map((c: { id: string }) => c.id)).toEqual([ids[0]]);
    expect(second.body.data.nextCursor).toBeNull();
  });

  it("leaves out hidden posts", async () => {
    const hidden = await post(owner.id, "Hidden by moderation");
    await sql`update public.posts set hidden_at = now() where id = ${hidden}`;
    const { body } = await postsTab(owner.handle, "?limit=50");
    expect(body.data.items.map((c: { id: string }) => c.id)).not.toContain(hidden);
  });
});

describe("GET /api/users/:handle/items", () => {
  it("shows only gear that's up for trade and available", async () => {
    const tradeable = await item(owner.id, "Up for trade", true);
    const notForTrade = await item(owner.id, "Keeping this", false);
    const reserved = await item(owner.id, "In a trade", true, "reserved");

    const { status, body } = await gearTab(owner.handle, "?limit=50");
    expect(status).toBe(200);
    for (const gear of body.data.items) itemSchema.parse(gear);
    const ids = body.data.items.map((i: { id: string }) => i.id);
    expect(ids).toContain(tradeable);
    expect(ids).not.toContain(notForTrade);
    expect(ids).not.toContain(reserved);
  });
});

describe("both tabs", () => {
  it("answer 404 for unknown and suspended people", async () => {
    const suspended = await createUser({ label: "susptab" });
    created.push(suspended.id);
    await sql`update public.users set suspended_at = now() where id = ${suspended.id}`;

    for (const handle of ["nobody_here_123", suspended.handle, "Not A Handle!"]) {
      expect((await postsTab(handle)).status, handle).toBe(404);
      expect((await gearTab(handle)).status, handle).toBe(404);
    }
  });
});
