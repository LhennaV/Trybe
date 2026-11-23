import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { confirmMeetup } from "@/server/trades/meetups";
import { getTrade } from "@/server/trades/read";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/meetup/confirm">;

// POST /api/trades/:id/meetup/confirm (MEET-01). The other person agrees to
// the suggested spot and time. No body. Safe to repeat. Returns the trade.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  await confirmMeetup(user, id);
  return ok(await getTrade(user.id, id));
});
