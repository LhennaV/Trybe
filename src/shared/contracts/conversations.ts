// Direct messages outside a trade, and message requests (CHAT-02, decided
// 2026-11-23, agreed by both owners). One conversation per pair of people.
// Someone you have no completed trade with lands in Requests and can send one
// message until you accept ("Accept chat", or simply replying). Responses are
// written from the viewer's side, like trades.

import { z } from "zod";
import { pageQuerySchema } from "@/shared/contracts/common";
import { MESSAGE_MAX, messageSchema } from "@/shared/contracts/trades";
import { handleSchema, userSummarySchema } from "@/shared/contracts/users";

// Which list: Chats (open ones, and requests I sent) or Requests (sent to me).
export const CONVERSATION_BOXES = ["chats", "requests"] as const;

// From the viewer's side:
// - open: both can write.
// - waiting: I sent a request and they haven't answered. A declined request
//   also shows as waiting, on purpose (declining is silent).
// - request: they sent me a request; I can accept, decline, or just reply.
export const CONVERSATION_STATES = ["open", "waiting", "request"] as const;
export const conversationStateSchema = z.enum(CONVERSATION_STATES);
export type ConversationState = z.infer<typeof conversationStateSchema>;

// A row in GET /api/conversations
export const conversationSchema = z.object({
  id: z.uuid(),
  other: userSummarySchema,
  state: conversationStateSchema,
  // The newest message, for the preview line.
  lastMessage: messageSchema.nullable(),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type Conversation = z.infer<typeof conversationSchema>;

// GET /api/conversations?box=chats|requests&cursor=&limit=
export const conversationsQuerySchema = pageQuerySchema.extend({
  box: z.enum(CONVERSATION_BOXES).default("chats"),
});
export type ConversationsQuery = z.infer<typeof conversationsQuerySchema>;

// POST /api/conversations. Messages someone by handle: starts the
// conversation, or continues the one you already have.
export const startConversationSchema = z.strictObject({
  handle: handleSchema,
  body: z.string().trim().min(1, "Write something first.").max(MESSAGE_MAX),
});
export type StartConversation = z.infer<typeof startConversationSchema>;

export const startConversationResultSchema = z.object({
  conversation: conversationSchema,
  message: messageSchema,
});
export type StartConversationResult = z.infer<typeof startConversationResultSchema>;
