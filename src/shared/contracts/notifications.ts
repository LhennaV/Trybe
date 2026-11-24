// In-app notifications (NOTIF-01). The server writes them when something
// happens to you; the person who acted is never notified. Draft: changes
// need agreement from both owners.

import { z } from "zod";
import { pageQuerySchema } from "@/shared/contracts/common";
import { userSummarySchema } from "@/shared/contracts/users";

export const NOTIFICATION_TYPES = [
  "trade_proposed",
  "trade_countered",
  "trade_accepted",
  "trade_declined",
  "trade_cancelled",
  "trade_completed",
  "meetup_suggested",
  "meetup_confirmed",
  // Unread messages from one chat fold into one notification.
  "message",
  "message_request",
  "rating_received",
] as const;
export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

// A row in GET /api/notifications. Open the trade or the conversation it
// points at; the app writes the sentence from `type` and `actor`.
export const notificationSchema = z.object({
  id: z.uuid(),
  type: notificationTypeSchema,
  // Who did it. Null for things the system did (an expired meetup, a
  // completed trade) and after that person deleted their account.
  actor: userSummarySchema.nullable(),
  tradeId: z.uuid().nullable(),
  conversationId: z.uuid().nullable(),
  read: z.boolean(),
  createdAt: z.iso.datetime({ offset: true }),
});
export type Notification = z.infer<typeof notificationSchema>;

// GET /api/notifications?cursor=&limit=
export const notificationsQuerySchema = pageQuerySchema;

// GET /api/notifications/unread, for the bell badge.
export const unreadCountSchema = z.object({ count: z.number().int().min(0) });

// POST /api/notifications/read. Marks these as read, or all of them when
// `ids` is left out.
export const markReadSchema = z.strictObject({
  ids: z.array(z.uuid()).min(1).max(100).optional(),
});
export type MarkRead = z.infer<typeof markReadSchema>;
