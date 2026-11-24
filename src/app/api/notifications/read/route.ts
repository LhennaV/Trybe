import { markReadSchema } from "@/shared/contracts/notifications";
import { requireUser } from "@/server/auth/session";
import { parseBody } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { markRead } from "@/server/notifications/notifications";

// POST /api/notifications/read. Body { ids } marks those as read; an empty
// body ({}) marks them all. Returns the new unread { count }.
export const POST = handleRoute(async (request) => {
  const user = await requireUser(request);
  return ok(await markRead(user.id, await parseBody(request, markReadSchema)));
});
