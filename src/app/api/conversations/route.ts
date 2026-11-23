import { connection } from "next/server";
import { conversationsQuerySchema, startConversationSchema } from "@/shared/contracts/conversations";
import { requireUser } from "@/server/auth/session";
import { parseBody, parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listConversations, startConversation } from "@/server/messages/conversations";
import { requireActiveUser } from "@/server/users/guards";

// GET /api/conversations?box=chats|requests&cursor=&limit= (CHAT-02).
// Chats: open conversations and requests I sent. Requests: sent to me.
export const GET = handleRoute(async (request) => {
  await connection();
  const user = await requireUser(request);
  return ok(await listConversations(user.id, parseQuery(request, conversationsQuerySchema)));
});

// POST /api/conversations. Message someone by handle: starts the
// conversation (a request if you haven't completed a trade together) or
// continues the one you have. Returns the conversation and the message.
export const POST = handleRoute(async (request) => {
  const user = await requireActiveUser(request);
  const input = await parseBody(request, startConversationSchema);
  return ok(await startConversation(user, input), 201);
});
