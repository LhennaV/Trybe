import { setMeetupSchema } from "@/shared/contracts/trades";
import { idParam } from "@/server/http/params";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { setMeetup } from "@/server/trades/meetups";
import { getTrade } from "@/server/trades/read";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/meetup">;

// POST /api/trades/:id/meetup (MEET-01). Suggest a spot and time after the
// trade is accepted; replaces any earlier suggestion. Returns the trade.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  const input = await parseBody(request, setMeetupSchema);
  await setMeetup(user, id, input);
  return ok(await getTrade(user.id, id));
});
