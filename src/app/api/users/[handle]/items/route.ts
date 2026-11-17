import { connection } from "next/server";
import { pageQuerySchema } from "@/shared/contracts/common";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listUserTradeItems } from "@/server/items/read";
import { findVisibleUserId } from "@/server/users/profile";

// GET /api/users/:handle/items?cursor=&limit= (PROF-03). Public. The
// profile's gear tab: gear that's up for trade and available, newest first.
export const GET = handleRoute(async (request, ctx: RouteContext<"/api/users/[handle]/items">) => {
  await connection();
  const userId = await findVisibleUserId((await ctx.params).handle);
  return ok(await listUserTradeItems(userId, parseQuery(request, pageQuerySchema)));
});
