import { connection } from "next/server";
import { myItemsQuerySchema } from "@/shared/contracts/items";
import { requireUser } from "@/server/auth/session";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listMyItems } from "@/server/items/read";

// GET /api/me/items?status=available&cursor=&limit=. The signed-in person's
// gear, newest first. Used by "My gear" and the propose screen.
export const GET = handleRoute(async (request) => {
  await connection();
  const user = await requireUser(request);
  return ok(await listMyItems(user.id, parseQuery(request, myItemsQuerySchema)));
});
