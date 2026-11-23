import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { answerRequest } from "@/server/messages/conversations";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/conversations/[id]/decline">;

// POST /api/conversations/:id/decline. Declines quietly: the sender isn't
// told, and can ask again after 7 days. Only the person the request was sent
// to. Returns the conversation.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  return ok(await answerRequest(user, idParam((await ctx.params).id, "chat"), "declined"));
});
