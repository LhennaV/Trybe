import { updateItemSchema } from "@/shared/contracts/items";
import { idParam } from "@/server/http/params";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { deleteItem, updateItem } from "@/server/items/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/items/[id]">;

// PATCH /api/items/:id. Only the fields sent change.
export const PATCH = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "item");
  const input = await parseBody(request, updateItemSchema);
  return ok(await updateItem(user, id, input));
});

// DELETE /api/items/:id. Removes the item and its photos.
export const DELETE = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  await deleteItem(user, idParam((await ctx.params).id, "item"));
  return ok({ deleted: true });
});
