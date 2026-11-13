import { createItemSchema } from "@/shared/contracts/items";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { createItem } from "@/server/items/write";
import { requireActiveUser } from "@/server/users/guards";

// POST /api/items. Adds gear. Upload its photos first with POST /api/photos.
export const POST = handleRoute(async (request) => {
  const user = await requireActiveUser(request);
  const input = await parseBody(request, createItemSchema);
  return ok(await createItem(user, input), 201);
});
