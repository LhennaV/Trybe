import { connection } from "next/server";
import { meetupSpotsQuerySchema } from "@/shared/contracts/trades";
import { parseQuery } from "@/server/http/parse";
import { handleRoute, ok } from "@/server/http/respond";
import { listMeetupSpots } from "@/server/trades/meetups";

// GET /api/meetup-spots?city=Quezon City (MEET-02). Public: curated safe
// places to meet. Without a city, every active spot.
export const GET = handleRoute(async (request) => {
  await connection();
  return ok(await listMeetupSpots(parseQuery(request, meetupSpotsQuerySchema)));
});
