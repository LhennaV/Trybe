import "server-only";
import { and, desc, eq, sql, type SQL } from "drizzle-orm";
import type { Page, PageQuery } from "@/shared/contracts/common";
import type { Message, SendMessage } from "@/shared/contracts/trades";
import type { SessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { messages, trades } from "@/server/db/schema";
import { withActor, type Tx } from "@/server/db/withActor";
import { AppError } from "@/server/errors";
import { decodeCursor, encodeCursor } from "@/server/http/cursor";
import { asksForContact } from "@/server/messages/contactInfo";

// A trade's chat (CHAT-01, TRD section 12). The server writes every message,
// so the checks below always run; the two people read new ones live through
// Supabase Realtime (policy in migration 0018) and older ones from here.
// To anyone outside the trade, the chat doesn't exist (404), like the trade.

type MessageRow = typeof messages.$inferSelect;

// The chat stays open while the trade is still going; after that it can be
// read but not added to.
const OPEN = new Set(["pending", "accepted"]);

async function findTrade(db: Tx | ReturnType<typeof getDb>, viewerId: string, tradeId: string) {
  const [trade] = await db
    .select({ id: trades.id, status: trades.status })
    .from(trades)
    .where(
      and(eq(trades.id, tradeId), sql`${viewerId}::uuid in (${trades.initiatorId}, ${trades.recipientId})`),
    )
    .limit(1);
  if (!trade) throw new AppError("TRADE_NOT_FOUND");
  return trade;
}

export function toMessage(row: MessageRow, viewerId: string): Message {
  const base = { id: row.id, createdAt: row.createdAt.toISOString() };
  // A deleted sender (null) is "them".
  const from = row.senderId === viewerId ? ("me" as const) : ("them" as const);
  if (row.type === "offer") return { ...base, type: "offer", from, offerId: row.offerId! };
  if (row.type === "system") return { ...base, type: "system", body: row.body! };
  return { ...base, type: "text", from, body: row.body!, asksForContact: row.asksForContact };
}

// POST /api/trades/:id/messages (CHAT-01, CHAT-04). The message is sent even
// when it asks for contact details; asksForContact tells the app to show the
// warning. TODO(Phase 5): refuse when either person blocked the other.
// TODO(CHAT-02): first contact goes to Requests, per message_permission.
export async function sendMessage(user: SessionUser, tradeId: string, input: SendMessage): Promise<Message> {
  return withActor(user.id, async (tx) => {
    const trade = await findTrade(tx, user.id, tradeId);
    if (!OPEN.has(trade.status)) {
      throw new AppError("TRADE_NOT_PENDING", "This trade is closed, so its chat is read only.");
    }
    const [row] = await tx
      .insert(messages)
      .values({
        tradeId,
        senderId: user.id,
        type: "text",
        body: input.body,
        asksForContact: asksForContact(input.body),
      })
      .returning();
    return toMessage(row, user.id);
  });
}

// GET /api/trades/:id/messages?cursor=&limit=. Newest first: the first page
// is the latest messages, and the cursor goes back in time. Clients show them
// oldest at the top.
export async function listMessages(viewerId: string, tradeId: string, query: PageQuery): Promise<Page<Message>> {
  const db = getDb();
  await findTrade(db, viewerId, tradeId);

  const cursor = decodeCursor(query.cursor);
  const conditions: SQL[] = [eq(messages.tradeId, tradeId)];
  if (cursor) {
    conditions.push(sql`(${messages.createdAt}, ${messages.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`);
  }

  // One extra row tells us whether there is a next page.
  const rows = await db
    .select({ message: messages, at: sql<string>`${messages.createdAt}::text` })
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(query.limit + 1);

  const page = rows.slice(0, query.limit);
  const last = page.at(-1);
  return {
    items: page.map((r) => toMessage(r.message, viewerId)),
    nextCursor: rows.length > query.limit && last ? encodeCursor({ at: last.at, id: last.message.id }) : null,
  };
}
