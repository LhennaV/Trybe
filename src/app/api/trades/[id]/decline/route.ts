import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade } from "@/server/trades/read";
import { declineTrade } from "@/server/trades/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/decline">;

// POST /api/trades/:id/decline (TRD-04).
// No body. Returns the updated trade.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  await declineTrade(user, id);
  return ok(await getTrade(user.id, id));
});
