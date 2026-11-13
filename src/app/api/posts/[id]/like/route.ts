import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { setLiked } from "@/server/posts/reactions";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/posts/[id]/like">;

// POST /api/posts/:id/like (POST-06). Safe to repeat.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  return ok(await setLiked(user, idParam((await ctx.params).id, "post"), true));
});

// DELETE /api/posts/:id/like. Safe to repeat.
export const DELETE = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  return ok(await setLiked(user, idParam((await ctx.params).id, "post"), false));
});
