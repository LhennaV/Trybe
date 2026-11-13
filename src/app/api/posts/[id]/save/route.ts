import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { setSaved } from "@/server/posts/reactions";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/posts/[id]/save">;

// POST /api/posts/:id/save (POST-07). Safe to repeat.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  return ok(await setSaved(user, idParam((await ctx.params).id, "post"), true));
});

// DELETE /api/posts/:id/save. Safe to repeat.
export const DELETE = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  return ok(await setSaved(user, idParam((await ctx.params).id, "post"), false));
});
