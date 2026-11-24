import "server-only";
import { and, count, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import type { Page, PageQuery } from "@/shared/contracts/common";
import type { MarkRead, Notification } from "@/shared/contracts/notifications";
import { getDb } from "@/server/db";
import { notifications, users } from "@/server/db/schema";
import { decodeCursor, encodeCursor } from "@/server/http/cursor";
import { toUserSummary } from "@/server/users/summary";

// In-app notifications (NOTIF-01). Triggers write them (migration 0025);
// this file only reads them and marks them read. Everyone sees only their own.

// GET /api/notifications?cursor=&limit=. Newest first.
export async function listNotifications(userId: string, query: PageQuery): Promise<Page<Notification>> {
  const cursor = decodeCursor(query.cursor);
  const conditions: SQL[] = [eq(notifications.userId, userId)];
  if (cursor) {
    conditions.push(
      sql`(${notifications.createdAt}, ${notifications.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`,
    );
  }

  // One extra row tells us whether there is a next page. A deleted actor
  // leaves actor_id null, hence the left join.
  const rows = await getDb()
    .select({ notification: notifications, actor: users, at: sql<string>`${notifications.createdAt}::text` })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.actorId))
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(query.limit + 1);

  const page = rows.slice(0, query.limit);
  const last = page.at(-1);
  return {
    items: page.map(({ notification: n, actor }) => ({
      id: n.id,
      type: n.type,
      actor: actor ? toUserSummary(actor) : null,
      tradeId: n.tradeId,
      conversationId: n.conversationId,
      read: n.readAt !== null,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor: rows.length > query.limit && last ? encodeCursor({ at: last.at, id: last.notification.id }) : null,
  };
}

// GET /api/notifications/unread. The bell badge.
export async function countUnread(userId: string): Promise<{ count: number }> {
  const [row] = await getDb()
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return { count: row.count };
}

// POST /api/notifications/read. Only ever touches the user's own; ids that
// aren't theirs are simply ignored. Returns the new unread count.
export async function markRead(userId: string, input: MarkRead): Promise<{ count: number }> {
  await getDb()
    .update(notifications)
    .set({ readAt: sql`now()` })
    .where(
      and(
        eq(notifications.userId, userId),
        isNull(notifications.readAt),
        input.ids ? inArray(notifications.id, input.ids) : undefined,
      ),
    );
  return countUnread(userId);
}
