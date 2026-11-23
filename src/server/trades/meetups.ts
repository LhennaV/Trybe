import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import type { MeetupSpot, MeetupSpotsQuery, SetMeetup } from "@/shared/contracts/trades";
import type { SessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { meetupSpots } from "@/server/db/schema";
import { withActor } from "@/server/db/withActor";
import { toTradeError } from "@/server/trades/dbErrors";

// Meetups (MEET-01, MEET-02). Suggesting and confirming go through their
// database functions (migration 0021), which lock the trade like every other
// trade action.

type SpotRow = typeof meetupSpots.$inferSelect;

export function toMeetupSpot(row: SpotRow): MeetupSpot {
  return { id: row.id, city: row.city, name: row.name, description: row.description, lat: row.lat, lng: row.lng };
}

// GET /api/meetup-spots?city=. Active spots only, by name.
export async function listMeetupSpots(query: MeetupSpotsQuery): Promise<MeetupSpot[]> {
  const rows = await getDb()
    .select()
    .from(meetupSpots)
    .where(
      and(
        eq(meetupSpots.active, true),
        query.city ? sql`lower(${meetupSpots.city}) = lower(${query.city})` : undefined,
      ),
    )
    .orderBy(asc(meetupSpots.city), asc(meetupSpots.name));
  return rows.map(toMeetupSpot);
}

async function run(actorId: string, statement: ReturnType<typeof sql>) {
  try {
    await withActor(actorId, (tx) => tx.execute(statement));
  } catch (error) {
    throw toTradeError(error);
  }
}

// POST /api/trades/:id/meetup. Replaces any earlier suggestion.
export async function setMeetup(user: SessionUser, tradeId: string, input: SetMeetup): Promise<void> {
  await run(
    user.id,
    sql`select app.trade_set_meetup(${tradeId}, ${user.id}, ${input.spotId}, ${input.meetupAt}::timestamptz)`,
  );
}

// POST /api/trades/:id/meetup/confirm. Safe to repeat.
export async function confirmMeetup(user: SessionUser, tradeId: string): Promise<void> {
  await run(user.id, sql`select app.trade_confirm_meetup(${tradeId}, ${user.id})`);
}
