import { connection } from "next/server";
import { handleRoute, ok } from "@/server/http/respond";
import { getPublicProfile } from "@/server/users/profile";

// GET /api/users/:handle. Public profile, no login needed.
export const GET = handleRoute(async (_request, ctx: RouteContext<"/api/users/[handle]">) => {
  await connection();
  const { handle } = await ctx.params;
  return ok(await getPublicProfile(handle));
});
