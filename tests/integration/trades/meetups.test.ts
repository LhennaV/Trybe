import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as spotsRoute } from "@/app/api/meetup-spots/route";
import { POST as confirmRoute } from "@/app/api/trades/[id]/meetup/confirm/route";
import { POST as meetupRoute } from "@/app/api/trades/[id]/meetup/route";
import { GET as messagesRoute } from "@/app/api/trades/[id]/messages/route";
import { meetupSpotSchema, tradeDetailSchema } from "@/shared/contracts/trades";
import { accept, categoryId, newItem, propose } from "../db/tradeHelpers";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// Meetups (migrations 0020 and 0021, MEET-01, MEET-02).
const sql = testSql();
const created: string[] = [];
type Person = { id: string; token: string };
let ana: Person;
let ben: Person;
let cy: Person;
let category: string;

// The two Quezon City spots seeded by migration 0021.
const TRINOMA = "5b0d6c1e-3f7a-4c2e-9a51-0e8f4d2b7c01";
const QMC = "5b0d6c1e-3f7a-4c2e-9a51-0e8f4d2b7c02";
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

async function person(label: string): Promise<Person> {
  const user = await createUser({ label });
  created.push(user.id);
  return { id: user.id, token: await accessToken(user.email) };
}

async function acceptedTrade() {
  const tradeId = await propose(sql, ana.id, [await newItem(sql, ana.id, category)], [await newItem(sql, ben.id, category)]);
  await accept(sql, tradeId, ben.id);
  return tradeId;
}

const params = (id: string) => ({ params: Promise.resolve({ id }) });

async function suggest(as: Person, tradeId: string, body: unknown) {
  return readJson(
    await meetupRoute(apiRequest(`/api/trades/${tradeId}/meetup`, { method: "POST", token: as.token, body }), params(tradeId)),
  );
}

async function confirm(as: Person, tradeId: string) {
  return readJson(
    await confirmRoute(apiRequest(`/api/trades/${tradeId}/meetup/confirm`, { method: "POST", token: as.token }), params(tradeId)),
  );
}

async function systemLines(as: Person, tradeId: string) {
  const res = await readJson(
    await messagesRoute(apiRequest(`/api/trades/${tradeId}/messages?limit=50`, { token: as.token }), params(tradeId)),
  );
  return (res.body.data.items as { type: string; body?: string }[])
    .filter((m) => m.type === "system")
    .map((m) => m.body!)
    .reverse();
}

beforeAll(async () => {
  [ana, ben, cy] = [await person("ana"), await person("ben"), await person("cy")];
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("GET /api/meetup-spots", () => {
  it("lists a city's active spots, whatever the case of the city", async () => {
    const res = await readJson(await spotsRoute(apiRequest("/api/meetup-spots?city=quezon%20city"), undefined));
    expect(res.status).toBe(200);
    const spots = meetupSpotSchema.array().parse(res.body.data);
    expect(spots.map((s) => s.id).sort()).toEqual([QMC, TRINOMA].sort());

    const none = await readJson(await spotsRoute(apiRequest("/api/meetup-spots?city=Atlantis"), undefined));
    expect(none.body.data).toEqual([]);
  });
});

describe("suggesting and confirming a meetup (MEET-01)", () => {
  it("lets one person suggest and the other confirm, from each side", async () => {
    const tradeId = await acceptedTrade();
    const meetupAt = inDays(3);

    const suggested = tradeDetailSchema.parse((await suggest(ana, tradeId, { spotId: TRINOMA, meetupAt })).body.data);
    expect(suggested.meetup).toMatchObject({
      spot: { id: TRINOMA, city: "Quezon City" },
      at: new Date(meetupAt).toISOString(),
      proposedBy: "me",
      confirmedByMe: true,
      confirmedByThem: false,
    });

    const own = await confirm(ana, tradeId);
    expect(own.status).toBe(403);
    expect(own.body.error.code).toBe("FORBIDDEN");

    const confirmed = tradeDetailSchema.parse((await confirm(ben, tradeId)).body.data);
    expect(confirmed.meetup).toMatchObject({ proposedBy: "them", confirmedByMe: true, confirmedByThem: true });
    expect((await confirm(ben, tradeId)).status).toBe(200); // safe to repeat

    // A new suggestion replaces the old one and needs confirming again.
    const changed = tradeDetailSchema.parse((await suggest(ben, tradeId, { spotId: QMC, meetupAt: inDays(4) })).body.data);
    expect(changed.meetup).toMatchObject({
      spot: { id: QMC },
      proposedBy: "me",
      confirmedByMe: true,
      confirmedByThem: false,
    });

    const lines = await systemLines(ana, tradeId);
    expect(lines[1]).toMatch(/^Meetup suggested: Trinoma Mall · main entrance, \w+ \d+, \d+:\d\d [AP]M\.$/);
    expect(lines[2]).toBe("Meetup confirmed. See you there!");
    expect(lines[3]).toMatch(/^Meetup suggested: Quezon Memorial Circle/);
  });

  it("only for accepted trades, real spots, and sensible times", async () => {
    const pending = await propose(sql, ana.id, [await newItem(sql, ana.id, category)], [await newItem(sql, ben.id, category)]);
    expect((await suggest(ana, pending, { spotId: TRINOMA, meetupAt: inDays(1) })).body.error.code).toBe(
      "TRADE_NOT_ACCEPTED",
    );

    const tradeId = await acceptedTrade();
    for (const body of [
      { spotId: TRINOMA, meetupAt: inDays(-1) },
      { spotId: TRINOMA, meetupAt: inDays(61) },
      { spotId: "00000000-0000-4000-8000-000000000000", meetupAt: inDays(1) },
      { spotId: TRINOMA },
    ]) {
      const res = await suggest(ana, tradeId, body);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_FAILED");
    }

    const nothing = await confirm(ben, tradeId);
    expect(nothing.status).toBe(409);
    expect(nothing.body.error.code).toBe("CONFLICT");

    expect((await suggest(cy, tradeId, { spotId: TRINOMA, meetupAt: inDays(1) })).body.error.code).toBe(
      "NOT_TRADE_MEMBER",
    );
  });

  it("refuses a spot that was switched off", async () => {
    const [spot] = await sql`
      insert into public.meetup_spots (city, name, description, lat, lng, active)
      values ('Test City', ${`Closed mall ${Date.now()}`}, 'Closed', 14.6, 121.0, false)
      returning id`;
    const tradeId = await acceptedTrade();
    expect((await suggest(ana, tradeId, { spotId: spot.id, meetupAt: inDays(1) })).body.error.message).toBe(
      "Pick a spot from the list.",
    );
    await sql`delete from public.meetup_spots where id = ${spot.id}`;
  });
});
