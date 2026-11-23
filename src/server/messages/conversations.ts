import "server-only";
import { and, desc, eq, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import type { Page, PageQuery } from "@/shared/contracts/common";
import type {
  Conversation,
  ConversationsQuery,
  StartConversation,
  StartConversationResult,
} from "@/shared/contracts/conversations";
import type { Message } from "@/shared/contracts/trades";
import type { SessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { conversations, messages, trades, users } from "@/server/db/schema";
import { withActor, type Tx } from "@/server/db/withActor";
import { AppError } from "@/server/errors";
import { decodeCursor, encodeCursor } from "@/server/http/cursor";
import { asksForContact } from "@/server/messages/contactInfo";
import { pageOfMessages, toMessage } from "@/server/messages/messages";
import { findVisibleUserId } from "@/server/users/profile";
import { toUserSummary } from "@/server/users/summary";

// Direct messages and message requests (CHAT-02, decided 2026-11-23):
// - One conversation per pair of people.
// - With a completed trade together, it's open straight away.
// - Otherwise the first message is a request: the sender can send one
//   message until the other person accepts or replies.
// - "Traded only" people can't be messaged by anyone they haven't completed
//   a trade with (CHAT-06).
// - Declining is silent: the sender keeps seeing "waiting", and can ask
//   again 7 days after their last request.
// TODO(Phase 5): refuse when either person blocked the other.

type ConversationRow = typeof conversations.$inferSelect;

const RE_REQUEST_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const NOT_FOUND = () => new AppError("NOT_FOUND", "We couldn't find that chat.");
const WAIT = () => new AppError("CONFLICT", "Wait for them to reply before sending more.");

const otherOf = (c: ConversationRow, userId: string) => (c.userAId === userId ? c.userBId : c.userAId);

function stateFor(c: ConversationRow, viewerId: string): Conversation["state"] {
  if (c.status === "accepted") return "open";
  return c.startedBy === viewerId ? "waiting" : "request";
}

async function tradedTogether(tx: Tx, a: string, b: string) {
  const [row] = await tx
    .select({ id: trades.id })
    .from(trades)
    .where(
      and(
        eq(trades.status, "completed"),
        or(
          and(eq(trades.initiatorId, a), eq(trades.recipientId, b)),
          and(eq(trades.initiatorId, b), eq(trades.recipientId, a)),
        ),
      ),
    )
    .limit(1);
  return Boolean(row);
}

// Locks the conversation and checks the viewer is in it.
async function lockConversation(tx: Tx, viewerId: string, conversationId: string) {
  const [row] = await tx.select().from(conversations).where(eq(conversations.id, conversationId)).for("update");
  if (!row || (row.userAId !== viewerId && row.userBId !== viewerId)) throw NOT_FOUND();
  return row;
}

// Decides whether the sender may write now, and moves the conversation along
// (opening it, or sending a fresh request). The conversation is locked.
async function admitSender(tx: Tx, c: ConversationRow, senderId: string): Promise<ConversationRow["status"]> {
  if (c.status === "accepted") return "accepted";
  const otherId = otherOf(c, senderId);

  // A completed trade together, or the other person answering: open.
  if (c.startedBy !== senderId || (await tradedTogether(tx, senderId, otherId))) return "accepted";

  // The person who asked. "Traded only" people refuse requests (CHAT-06).
  const [other] = await tx
    .select({ permission: users.messagePermission })
    .from(users)
    .where(eq(users.id, otherId))
    .limit(1);
  if (other?.permission === "traded_only") {
    throw new AppError("FORBIDDEN", "They only take messages from people they've traded with.");
  }

  if (c.status === "declined") {
    // Silent decline: same answer as waiting until 7 days pass.
    if (Date.now() - c.requestedAt.getTime() < RE_REQUEST_AFTER_MS) throw WAIT();
    return "requested";
  }

  // Requested: one message until they answer.
  const [sent] = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(messages)
    .where(and(eq(messages.conversationId, c.id), eq(messages.senderId, senderId)));
  if (sent.n > 0) throw WAIT();
  return "requested";
}

async function send(tx: Tx, c: ConversationRow, sender: SessionUser, body: string) {
  const status = await admitSender(tx, c, sender.id);
  const reRequest = c.status === "declined" && status === "requested";
  const [conversation] = await tx
    .update(conversations)
    .set({ status, lastMessageAt: sql`now()`, ...(reRequest && { requestedAt: sql`now()` }) })
    .where(eq(conversations.id, c.id))
    .returning();
  const [row] = await tx
    .insert(messages)
    .values({ conversationId: c.id, senderId: sender.id, type: "text", body, asksForContact: asksForContact(body) })
    .returning();
  return { conversation, message: toMessage(row, sender.id) };
}

// Builds list rows: the other person and the newest message of each.
async function toConversations(rows: ConversationRow[], viewerId: string): Promise<Conversation[]> {
  if (rows.length === 0) return [];
  const db = getDb();
  const ids = rows.map((r) => r.id);
  const [people, latest] = await Promise.all([
    db
      .select()
      .from(users)
      .where(inArray(users.id, rows.map((r) => otherOf(r, viewerId)))),
    db
      .selectDistinctOn([messages.conversationId])
      .from(messages)
      .where(inArray(messages.conversationId, ids))
      .orderBy(messages.conversationId, desc(messages.createdAt), desc(messages.id)),
  ]);
  const personById = new Map(people.map((p) => [p.id, p]));
  const lastById = new Map(latest.map((m) => [m.conversationId!, m]));

  return rows.flatMap((c) => {
    const other = personById.get(otherOf(c, viewerId));
    if (!other) return [];
    const last = lastById.get(c.id);
    return [
      {
        id: c.id,
        other: toUserSummary(other),
        state: stateFor(c, viewerId),
        lastMessage: last ? toMessage(last, viewerId) : null,
        updatedAt: c.lastMessageAt.toISOString(),
      },
    ];
  });
}

// POST /api/conversations. Messages someone by handle: starts the
// conversation, or continues the one the two of you already have.
export async function startConversation(user: SessionUser, input: StartConversation): Promise<StartConversationResult> {
  const otherId = await findVisibleUserId(input.handle);
  if (otherId === user.id) throw new AppError("VALIDATION_FAILED", "You can't message yourself.");
  const [userAId, userBId] = user.id < otherId ? [user.id, otherId] : [otherId, user.id];

  const result = await withActor(user.id, async (tx) => {
    // Two people starting at the same moment meet at the unique pair.
    await tx.insert(conversations).values({ userAId, userBId, startedBy: user.id }).onConflictDoNothing();
    const [existing] = await tx
      .select()
      .from(conversations)
      .where(and(eq(conversations.userAId, userAId), eq(conversations.userBId, userBId)))
      .for("update");
    return send(tx, existing, user, input.body);
  });
  const [conversation] = await toConversations([result.conversation], user.id);
  return { conversation, message: result.message };
}

// POST /api/conversations/:id/messages
export async function sendConversationMessage(user: SessionUser, conversationId: string, body: string): Promise<Message> {
  return withActor(user.id, async (tx) => {
    const c = await lockConversation(tx, user.id, conversationId);
    return (await send(tx, c, user, body)).message;
  });
}

// POST /api/conversations/:id/accept and /decline. Only the person the
// request was sent to, while it's waiting.
export async function answerRequest(
  user: SessionUser,
  conversationId: string,
  answer: "accepted" | "declined",
): Promise<Conversation> {
  const row = await withActor(user.id, async (tx) => {
    const c = await lockConversation(tx, user.id, conversationId);
    if (c.startedBy === user.id) throw new AppError("FORBIDDEN", "This is your request. Wait for them to answer.");
    if (c.status !== "requested") throw new AppError("CONFLICT", "There's no request to answer here.");
    const [updated] = await tx
      .update(conversations)
      .set({ status: answer })
      .where(eq(conversations.id, c.id))
      .returning();
    return updated;
  });
  const [conversation] = await toConversations([row], user.id);
  return conversation;
}

// GET /api/conversations?box=chats|requests. Chats: open conversations and
// requests I sent (a declined one still shows as waiting). Requests: requests
// sent to me that I haven't answered. Most recent first.
export async function listConversations(viewerId: string, query: ConversationsQuery): Promise<Page<Conversation>> {
  const mine = or(eq(conversations.userAId, viewerId), eq(conversations.userBId, viewerId));
  const box =
    query.box === "requests"
      ? and(eq(conversations.status, "requested"), ne(conversations.startedBy, viewerId))
      : or(eq(conversations.status, "accepted"), eq(conversations.startedBy, viewerId));

  const cursor = decodeCursor(query.cursor);
  const conditions: (SQL | undefined)[] = [mine, box];
  if (cursor) {
    conditions.push(
      sql`(${conversations.lastMessageAt}, ${conversations.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`,
    );
  }

  // One extra row tells us whether there is a next page.
  const rows = await getDb()
    .select({ conversation: conversations, at: sql<string>`${conversations.lastMessageAt}::text` })
    .from(conversations)
    .where(and(...conditions))
    .orderBy(desc(conversations.lastMessageAt), desc(conversations.id))
    .limit(query.limit + 1);

  const page = rows.slice(0, query.limit);
  const last = page.at(-1);
  return {
    items: await toConversations(
      page.map((r) => r.conversation),
      viewerId,
    ),
    nextCursor: rows.length > query.limit && last ? encodeCursor({ at: last.at, id: last.conversation.id }) : null,
  };
}

// GET /api/conversations/:id/messages. Newest first, like trade chats.
export async function listConversationMessages(
  viewerId: string,
  conversationId: string,
  query: PageQuery,
): Promise<Page<Message>> {
  const [c] = await getDb()
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.userAId, viewerId), eq(conversations.userBId, viewerId)),
      ),
    )
    .limit(1);
  if (!c) throw NOT_FOUND();
  return pageOfMessages(eq(messages.conversationId, conversationId), viewerId, query);
}
