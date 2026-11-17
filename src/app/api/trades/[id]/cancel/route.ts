import { cancelTradeSchema } from "@/shared/contracts/trades";
import { idParam } from "@/server/http/params";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade } from "@/server/trades/read";
import { cancelTrade } from "@/server/trades/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/cancel">;

// POST /api/trades/:id/cancel (TRD-08, MEET-06). Either person, before
// completion. Returns the updated trade.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  const input = await parseBody(request, cancelTradeSchema);
  await cancelTrade(user, id, input);
  return ok(await getTrade(user.id, id));
});
