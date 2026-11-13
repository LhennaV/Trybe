import "server-only";
import { and, asc, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { Page } from "@/shared/contracts/common";
import type { Item, MyItemsQuery } from "@/shared/contracts/items";
import { getDb } from "@/server/db";
import { categories, itemPhotos, items, photos } from "@/server/db/schema";
import { decodeCursor, encodeCursor } from "@/server/http/cursor";
import { toPhoto } from "@/server/photos/photos";

// Loads full items (category and photos) in the order of `ids`.
export async function loadItems(ids: string[]): Promise<Item[]> {
  if (ids.length === 0) return [];
  const db = getDb();

  const [rows, photoRows] = await Promise.all([
    db
      .select({ item: items, category: { id: categories.id, name: categories.name, hobbyId: categories.hobbyId } })
      .from(items)
      .innerJoin(categories, eq(categories.id, items.categoryId))
      .where(inArray(items.id, ids)),
    db
      .select({ itemId: itemPhotos.itemId, photo: photos })
      .from(itemPhotos)
      .innerJoin(photos, eq(photos.id, itemPhotos.photoId))
      .where(inArray(itemPhotos.itemId, ids))
      .orderBy(asc(itemPhotos.position)),
  ]);

  const byId = new Map(
    rows.map(({ item, category }) => [
      item.id,
      {
        id: item.id,
        ownerId: item.ownerId,
        name: item.name,
        category,
        condition: item.condition,
        photos: photoRows.filter((p) => p.itemId === item.id).map((p) => toPhoto(p.photo)),
        upForTrade: item.upForTrade,
        lookingFor: item.lookingFor,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      } satisfies Item,
    ]),
  );
  return ids.flatMap((id) => byId.get(id) ?? []);
}

// GET /api/me/items?status=&cursor=&limit=. Newest first.
export async function listMyItems(ownerId: string, query: MyItemsQuery): Promise<Page<Item>> {
  const cursor = decodeCursor(query.cursor);
  const conditions: SQL[] = [eq(items.ownerId, ownerId)];
  if (query.status) conditions.push(eq(items.status, query.status));
  if (cursor) conditions.push(sql`(${items.createdAt}, ${items.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`);

  // One extra row tells us whether there is a next page.
  const rows = await getDb()
    .select({ id: items.id, at: sql<string>`${items.createdAt}::text` })
    .from(items)
    .where(and(...conditions))
    .orderBy(desc(items.createdAt), desc(items.id))
    .limit(query.limit + 1);

  const page = rows.slice(0, query.limit);
  const last = page.at(-1);
  return {
    items: await loadItems(page.map((r) => r.id)),
    nextCursor: rows.length > query.limit && last ? encodeCursor({ at: last.at, id: last.id }) : null,
  };
}
