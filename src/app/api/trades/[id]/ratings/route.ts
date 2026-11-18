import { submitRatingSchema } from "@/shared/contracts/trades";
import { idParam } from "@/server/http/params";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade } from "@/server/trades/read";
import { rateTrade } from "@/server/trades/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/ratings">;

// POST /api/trades/:id/ratings (RATE-01). Once per person, after the trade is
// completed. Returns the trade, now with ratedByMe true.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  const input = await parseBody(request, submitRatingSchema);
  await rateTrade(user, id, input);
  return ok(await getTrade(user.id, id), 201);
});
