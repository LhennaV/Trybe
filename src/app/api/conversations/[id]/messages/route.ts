import { connection } from "next/server";
import { pageQuerySchema } from "@/shared/contracts/common";
import { sendMessageSchema } from "@/shared/contracts/trades";
import { requireUser } from "@/server/auth/session";
import { idParam } from "@/server/http/params";
import { parseBody, parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listConversationMessages, sendConversationMessage } from "@/server/messages/conversations";
import { requireActiveUser } from "@/server/users/guards";

type Ctx = RouteContext<"/api/conversations/[id]/messages">;

// GET /api/conversations/:id/messages?cursor=&limit=. Newest first. New ones
// also arrive live through Supabase Realtime.
export const GET = handleRoute(async (request, ctx: Ctx) => {
  await connection();
  const user = await requireUser(request);
  const id = idParam((await ctx.params).id, "chat");
  return ok(await listConversationMessages(user.id, id, parseQuery(request, pageQuerySchema)));
});

// POST /api/conversations/:id/messages (CHAT-01, CHAT-02, CHAT-04). Replying
// to a request accepts it. Someone waiting on their request gets 409.
export const POST = handleRoute(async (request, ctx: Ctx) => {
  const user = await requireActiveUser(request);
  const id = idParam((await ctx.params).id, "chat");
  const input = await parseBody(request, sendMessageSchema);
  return ok(await sendConversationMessage(user, id, input.body), 201);
});
