import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST_PHOTOS_MAX } from "@/shared/contracts/posts";
import { createUser, deleteUsers, testSql } from "../helpers";

// The Phase 2 tables (migrations 0007 to 0009): the rules the database itself
// enforces, so they hold even if an endpoint forgets a check. Endpoints get
// their own tests when they're built.
const sql = testSql();
const created: string[] = [];
let ownerId: string;
let potteryId: string;
let wheelsId: string;

async function newPhoto(n: number) {
  const [row] = await sql`
    insert into public.photos (owner_id, path, thumb_path, width, height)
    values (${ownerId}, ${`test/${ownerId}/${n}.webp`}, ${`test/${ownerId}/${n}-thumb.webp`}, 1600, 1200)
    returning id`;
  return row.id as string;
}

async function newItem(name = "Shimpo wheel") {
  const [row] = await sql`
    insert into public.items (owner_id, name, category_id, condition)
    values (${ownerId}, ${name}, ${wheelsId}, 'good')
    returning id, status, up_for_trade`;
  return row;
}

async function newPost() {
  const [row] = await sql`
    insert into public.posts (user_id, hobby_id, title)
    values (${ownerId}, ${potteryId}, 'First mug set')
    returning id, caption`;
  return row;
}

beforeAll(async () => {
  const owner = await createUser({ label: "gear" });
  created.push(owner.id);
  ownerId = owner.id;
  const [pottery] = await sql`select id from public.hobbies where slug = 'pottery'`;
  potteryId = pottery.id;
  const [wheels] = await sql`select id from public.categories where hobby_id = ${potteryId} and slug = 'wheels-kilns'`;
  wheelsId = wheels.id;
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("categories (migration 0008)", () => {
  it("gives every hobby its categories, with Other last", async () => {
    const rows = await sql`
      select h.slug as hobby, array_agg(c.slug order by c.position) as slugs
      from public.hobbies h join public.categories c on c.hobby_id = h.id
      group by h.slug`;
    expect(rows).toHaveLength(15);
    for (const row of rows) {
      expect(row.slugs.length, row.hobby).toBeGreaterThanOrEqual(2);
      expect(row.slugs.at(-1), row.hobby).toBe("other");
    }
    const pottery = rows.find((r) => r.hobby === "pottery");
    expect(pottery?.slugs).toEqual(["wheels-kilns", "hand-tools", "clay-glaze", "other"]);
  });
});

describe("items", () => {
  it("starts available and not up for trade", async () => {
    const item = await newItem();
    expect(item).toMatchObject({ status: "available", up_for_trade: false });
  });

  it("refuses unknown conditions and statuses, and empty names", async () => {
    await expect(
      sql`insert into public.items (owner_id, name, category_id, condition) values (${ownerId}, 'X', ${wheelsId}, 'mint')`,
    ).rejects.toThrow(/ck_items_condition/);
    const item = await newItem();
    await expect(sql`update public.items set status = 'sold' where id = ${item.id}`).rejects.toThrow(/ck_items_status/);
    await expect(
      sql`insert into public.items (owner_id, name, category_id, condition) values (${ownerId}, '', ${wheelsId}, 'good')`,
    ).rejects.toThrow(/ck_items_name_length/);
  });

  it("records changes in the audit log", async () => {
    const item = await newItem("Audited wheel");
    const [entry] = await sql`
      select action from app.audit_log where table_name = 'items' and record_id = ${item.id}`;
    expect(entry?.action).toBe("INSERT");
  });

  it("lets a photo belong to only one item, in order", async () => {
    const [first, second] = [await newItem("A"), await newItem("B")];
    const photo = await newPhoto(1);

    await sql`insert into public.item_photos (item_id, photo_id, position) values (${first.id}, ${photo}, 0)`;
    await expect(
      sql`insert into public.item_photos (item_id, photo_id, position) values (${second.id}, ${photo}, 0)`,
    ).rejects.toThrow(/uq_item_photos_photo_id/);
    await expect(
      sql`insert into public.item_photos (item_id, photo_id, position) values (${first.id}, ${await newPhoto(2)}, 0)`,
    ).rejects.toThrow(/uq_item_photos_item_id_position/);
    await expect(
      sql`insert into public.item_photos (item_id, photo_id, position) values (${first.id}, ${await newPhoto(3)}, 4)`,
    ).rejects.toThrow(/ck_item_photos_position/);
  });
});

describe("posts", () => {
  it("has one hobby and an empty caption by default", async () => {
    expect((await newPost()).caption).toBe("");
  });

  it(`allows up to ${POST_PHOTOS_MAX} photos`, async () => {
    const post = await newPost();
    await sql`insert into public.post_photos (post_id, photo_id, position) values (${post.id}, ${await newPhoto(10)}, ${POST_PHOTOS_MAX - 1})`;
    await expect(
      sql`insert into public.post_photos (post_id, photo_id, position) values (${post.id}, ${await newPhoto(11)}, ${POST_PHOTOS_MAX})`,
    ).rejects.toThrow(/ck_post_photos_position/);
  });

  it("allows one like and one save per person per post", async () => {
    const post = await newPost();
    await sql`insert into public.likes (user_id, post_id) values (${ownerId}, ${post.id})`;
    await expect(sql`insert into public.likes (user_id, post_id) values (${ownerId}, ${post.id})`).rejects.toThrow(
      /uq_likes_user_id_post_id/,
    );
    await sql`insert into public.saves (user_id, post_id) values (${ownerId}, ${post.id})`;
    await expect(sql`insert into public.saves (user_id, post_id) values (${ownerId}, ${post.id})`).rejects.toThrow(
      /uq_saves_user_id_post_id/,
    );
  });

  it("tags an item only once", async () => {
    const [post, item] = [await newPost(), await newItem("Tagged")];
    await sql`insert into public.post_items (post_id, item_id) values (${post.id}, ${item.id})`;
    await expect(sql`insert into public.post_items (post_id, item_id) values (${post.id}, ${item.id})`).rejects.toThrow(
      /uq_post_items_post_id_item_id/,
    );
  });
});

describe("account deletion", () => {
  it("removes a person's photos, items, posts, likes, and saves with them", async () => {
    const other = await createUser({ label: "gone" });
    const [post] = await sql`
      insert into public.posts (user_id, hobby_id, title) values (${other.id}, ${potteryId}, 'Bye') returning id`;
    await sql`insert into public.items (owner_id, name, category_id, condition) values (${other.id}, 'Old wheel', ${wheelsId}, 'fair')`;
    await sql`insert into public.likes (user_id, post_id) values (${other.id}, ${post.id})`;

    await deleteUsers([other.id]);

    const [counts] = await sql`
      select
        (select count(*) from public.items where owner_id = ${other.id})::int as items,
        (select count(*) from public.posts where user_id = ${other.id})::int as posts,
        (select count(*) from public.likes where user_id = ${other.id})::int as likes`;
    expect(counts).toEqual({ items: 0, posts: 0, likes: 0 });
  });
});
