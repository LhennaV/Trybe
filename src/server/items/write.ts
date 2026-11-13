import "server-only";
import { asc, eq } from "drizzle-orm";
import type { CreateItem, Item, UpdateItem } from "@/shared/contracts/items";
import type { SessionUser } from "@/server/auth/session";
import { findPgError, PG_FOREIGN_KEY_VIOLATION } from "@/server/db/pgError";
import { itemPhotos, items } from "@/server/db/schema";
import { withActor, type Tx } from "@/server/db/withActor";
import { AppError } from "@/server/errors";
import { loadItems } from "@/server/items/read";
import { claimPhotos, removePhotoRows } from "@/server/photos/photos";
import { deletePhotos } from "@/server/uploads/storage";

// Items: a person's gear (TRD section 8.3).

function toItemError(error: unknown): unknown {
  const pg = findPgError(error);
  if (pg?.code === PG_FOREIGN_KEY_VIOLATION && pg.constraint === "items_category_id_categories_id_fk") {
    return new AppError("VALIDATION_FAILED", "Pick a category from the list.", { categoryId: ["Pick a category from the list."] });
  }
  return error;
}

async function setItemPhotos(tx: Tx, itemId: string, photoIds: string[]) {
  await tx.delete(itemPhotos).where(eq(itemPhotos.itemId, itemId));
  await tx.insert(itemPhotos).values(photoIds.map((photoId, position) => ({ itemId, photoId, position })));
}

// Locks the item and checks it can be changed: it exists, it's yours, and it
// isn't in an accepted or finished trade (ITEM-04, ITEM-05).
async function lockOwnItem(tx: Tx, user: SessionUser, itemId: string) {
  const [item] = await tx.select().from(items).where(eq(items.id, itemId)).for("update");
  if (!item) throw new AppError("NOT_FOUND", "We couldn't find that item.");
  if (item.ownerId !== user.id) throw new AppError("ITEM_NOT_OWNED", "That item isn't yours.");
  if (item.status !== "available") {
    throw new AppError("ITEM_NOT_AVAILABLE", "This item is in a trade, so it can't be changed right now.");
  }
  return item;
}

// POST /api/items (ITEM-01, ITEM-02)
export async function createItem(user: SessionUser, input: CreateItem): Promise<Item> {
  let itemId: string;
  try {
    itemId = await withActor(user.id, async (tx) => {
      await claimPhotos(tx, user.id, input.photoIds);
      const [item] = await tx
        .insert(items)
        .values({
          ownerId: user.id,
          name: input.name,
          categoryId: input.categoryId,
          condition: input.condition,
          upForTrade: input.upForTrade,
          lookingFor: input.lookingFor || null,
        })
        .returning({ id: items.id });
      await setItemPhotos(tx, item.id, input.photoIds);
      return item.id;
    });
  } catch (error) {
    throw toItemError(error);
  }
  const [item] = await loadItems([itemId]);
  return item;
}

// PATCH /api/items/:id (ITEM-05). Only the fields sent change.
export async function updateItem(user: SessionUser, itemId: string, input: UpdateItem): Promise<Item> {
  let dropped: string[] = [];
  try {
    dropped = await withActor(user.id, async (tx) => {
      await lockOwnItem(tx, user, itemId);

      const { photoIds, lookingFor, ...fields } = input;
      const columns = { ...fields, ...(lookingFor !== undefined && { lookingFor: lookingFor || null }) };
      if (Object.keys(columns).length > 0) await tx.update(items).set(columns).where(eq(items.id, itemId));

      if (!photoIds) return [];
      const before = await tx
        .select({ photoId: itemPhotos.photoId })
        .from(itemPhotos)
        .where(eq(itemPhotos.itemId, itemId))
        .orderBy(asc(itemPhotos.position));
      await claimPhotos(tx, user.id, photoIds, { itemId });
      await setItemPhotos(tx, itemId, photoIds);
      return removePhotoRows(
        tx,
        before.map((p) => p.photoId).filter((id) => !photoIds.includes(id)),
      );
    });
  } catch (error) {
    throw toItemError(error);
  }
  await deletePhotos(dropped);
  const [item] = await loadItems([itemId]);
  return item;
}

// DELETE /api/items/:id (ITEM-05). Removes the item, its photos, and its tags
// on posts.
export async function deleteItem(user: SessionUser, itemId: string): Promise<void> {
  const files = await withActor(user.id, async (tx) => {
    await lockOwnItem(tx, user, itemId);
    const attached = await tx.select({ photoId: itemPhotos.photoId }).from(itemPhotos).where(eq(itemPhotos.itemId, itemId));
    await tx.delete(items).where(eq(items.id, itemId));
    return removePhotoRows(
      tx,
      attached.map((p) => p.photoId),
    );
  });
  await deletePhotos(files);
}
