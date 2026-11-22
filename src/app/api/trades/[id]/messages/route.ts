import { connection } from "next/server";
import { pageQuerySchema } from "@/shared/contracts/common";
import { sendMessageSchema } from "@/shared/contracts/trades";
import { requireUser } from "@/server/auth/session";
import { idParam } from "@/server/http/params";
import { parseBody, parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listMessages, sendMessage } from "@/server/messages/messages";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/trades/[id]/messages">;

// GET /api/trades/:id/messages?cursor=&limit= (CHAT-01). Newest first. New
// messages also arrive live through Supabase Realtime.
export const GET = handleRoute(async (request, ctx: Ctx) => {
  await connection();
  const user = await requireUser(request);
  const id = idParam((await ctx.params).id, "trade");
  return ok(await listMessages(user.id, id, parseQuery(request, pageQuerySchema)));
});

// POST /api/trades/:id/messages (CHAT-01, CHAT-04). Returns the message;
// asksForContact true means show the "keep it in Trybe" warning.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "trade");
  const input = await parseBody(request, sendMessageSchema);
  return ok(await sendMessage(user, id, input), 201);
});
