import { connection } from "next/server";
import { pageQuerySchema } from "@/shared/contracts/common";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listUserReviews } from "@/server/ratings/read";
import { findVisibleUserId } from "@/server/users/profile";

// GET /api/users/:handle/reviews?cursor=&limit= (PROF-03). Public. The
// profile's reviews tab: only ratings already shown (RATE-02), newest first.
export const GET = handleRoute(async (request, ctx: RouteContext<"/api/users/[handle]/reviews">) => {
  await connection();
  const userId = await findVisibleUserId((await ctx.params).handle);
  return ok(await listUserReviews(userId, parseQuery(request, pageQuerySchema)));
});
