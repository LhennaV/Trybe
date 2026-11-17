import { counterOfferSchema } from "@/shared/contracts/trades";
import { idParam } from "@/server/http/params";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade } from "@/server/trades/read";
import { counterTrade } from "@/server/trades/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/counter">;

// POST /api/trades/:id/counter (TRD-03). Returns the trade with the new offer.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  const input = await parseBody(request, counterOfferSchema);
  await counterTrade(user, id, input);
  return ok(await getTrade(user.id, id));
});
