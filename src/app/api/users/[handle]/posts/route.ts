import { connection } from "next/server";
import { pageQuerySchema } from "@/shared/contracts/common";
import { getSessionUser } from "@/server/auth/session";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listUserPosts } from "@/server/posts/read";
import { findVisibleUserId } from "@/server/users/profile";

// GET /api/users/:handle/posts?cursor=&limit= (PROF-03). Public. The
// profile's posts tab, newest first, same cards as the feed.
export const GET = handleRoute(async (request, ctx: RouteContext<"/api/users/[handle]/posts">) => {
  await connection();
  const userId = await findVisibleUserId((await ctx.params).handle);
  const query = parseQuery(request, pageQuerySchema);
  const viewer = await getSessionUser(request);
  return ok(await listUserPosts(userId, query, viewer?.id ?? null));
});
