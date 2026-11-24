import { connection } from "next/server";
import { notificationsQuerySchema } from "@/shared/contracts/notifications";
import { requireUser } from "@/server/auth/session";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listNotifications } from "@/server/notifications/notifications";

// GET /api/notifications?cursor=&limit= (NOTIF-01). Mine, newest first.
export const GET = handleRoute(async (request) => {
  await connection();
  const user = await requireUser(request);
  return ok(await listNotifications(user.id, parseQuery(request, notificationsQuerySchema)));
});
