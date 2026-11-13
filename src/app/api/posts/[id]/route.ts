import { connection } from "next/server";
import { updatePostSchema } from "@/shared/contracts/posts";
import { getSessionUser } from "@/server/auth/session";
import { idParam } from "@/server/http/params";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { getPostDetail } from "@/server/posts/read";
import { deletePost, updatePost } from "@/server/posts/write";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/posts/[id]">;

// GET /api/posts/:id. Public.
export const GET = handleRoute(async (request, ctx: Ctx) => {
  await connection();
  const id = idParam((await ctx.params).id, "post");
  const viewer = await getSessionUser(request);
  return ok(await getPostDetail(id, viewer?.id ?? null));
});

// PATCH /api/posts/:id (POST-09). Only the fields sent change.
export const PATCH = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "post");
  const input = await parseBody(request, updatePostSchema);
  return ok(await updatePost(user, id, input));
});

// DELETE /api/posts/:id (POST-09)
export const DELETE = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  await deletePost(user, idParam((await ctx.params).id, "post"));
  return ok({ deleted: true });
});
