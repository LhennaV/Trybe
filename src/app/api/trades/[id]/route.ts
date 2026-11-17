import { connection } from "next/server";
import { requireUser } from "@/server/auth/session";
import { idParam } from "@/server/http/params";
import { handleRoute, ok } from "@/server/http/respond";
import { getTrade } from "@/server/trades/read";

type Ctx = RouteContext<"/api/trades/[id]">;

// GET /api/trades/:id. Only the two people in the trade can read it.
export const GET = handleRoute(async (request, ctx: Ctx) => {
  await connection();
  const user = await requireUser(request);
  return ok(await getTrade(user.id, idParam((await ctx.params).id, "trade")));
});
