import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade } from "@/server/trades/read";
import { acceptTrade } from "@/server/trades/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/accept">;

// POST /api/trades/:id/accept (TRD-04, TRD-06). Reserves the items and
// cancels other pending trades for them. No body. Returns the updated trade.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  await acceptTrade(user, id);
  return ok(await getTrade(user.id, id));
});
