import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade } from "@/server/trades/read";
import { completeTrade } from "@/server/trades/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/complete">;

// POST /api/trades/:id/complete (MEET-05). Confirms the handoff from my side.
// The trade completes when both people have confirmed, and its items become
// traded. No body. Safe to repeat. Returns the updated trade.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  await completeTrade(user, id);
  return ok(await getTrade(user.id, id));
});
