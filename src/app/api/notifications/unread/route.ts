import { connection } from "next/server";
import { requireUser } from "@/server/auth/session";
import { handleRoute, ok } from "@/server/http/respond";
import { countUnread } from "@/server/notifications/notifications";

// GET /api/notifications/unread. { count } for the bell badge.
export const GET = handleRoute(async (request) => {
  await connection();
  const user = await requireUser(request);
  return ok(await countUnread(user.id));
});
