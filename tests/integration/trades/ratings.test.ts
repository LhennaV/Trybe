import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as rateRoute } from "@/app/api/trades/[id]/ratings/route";
import { GET as profileRoute } from "@/app/api/users/[handle]/route";
import { categoryId, newItem, propose } from "../db/tradeHelpers";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// Ratings (migrations 0013 and 0014, RATE-01 and RATE-02). Completing a trade
// comes later in Phase 4, so these tests mark trades completed straight in
// the database.
const sql = testSql();
const created: string[] = [];
type Person = { id: string; token: string; handle: string };
let ana: Person;
let ben: Person;
let cy: Person;
let category: string;

async function person(label: string): Promise<Person> {
  const user = await createUser({ label });
  created.push(user.id);
  return { id: user.id, handle: user.handle, token: await accessToken(user.email) };
}

// A trade between Ana and Ben, completed unless `status` says otherwise.
async function tradeBetween(a: Person, b: Person, status = "completed") {
  const tradeId = await propose(sql, a.id, [await newItem(sql, a.id, category)], [await newItem(sql, b.id, category)]);
  await sql`update public.trades set status = ${status} where id = ${tradeId}`;
  return tradeId;
}

const GOOD = { score: 5, tags: ["On time", "Friendly"], note: "Smooth swap!" };

async function rate(as: Person, tradeId: string, body: unknown = GOOD) {
  return readJson(
    await rateRoute(apiRequest(`/api/trades/${tradeId}/ratings`, { method: "POST", token: as.token, body }), {
      params: Promise.resolve({ id: tradeId }),
    }),
  );
}

async function profile(handle: string) {
  const res = await readJson(await profileRoute(apiRequest(`/api/users/${handle}`), { params: Promise.resolve({ handle }) }));
  return res.body.data as { rating: number | null; reviewCount: number; tradeCount: number };
}

async function ratingsOf(tradeId: string) {
  return sql`select rater_id, ratee_id, score, tags, note, visible_at from public.ratings where trade_id = ${tradeId}`;
}

beforeAll(async () => {
  [ana, ben, cy] = [await person("ana"), await person("ben"), await person("cy")];
  category = await categoryId(sql);
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("POST /api/trades/:id/ratings", () => {
  it("saves a hidden rating until the other person rates too", async () => {
    const pair = [await person("rater"), await person("ratee")];
    const tradeId = await tradeBetween(pair[0], pair[1]);

    const first = await rate(pair[0], tradeId);
    expect(first.status).toBe(201);
    expect(first.body.data.ratedByMe).toBe(true);
    const [hidden] = await ratingsOf(tradeId);
    expect(hidden).toMatchObject({ rater_id: pair[0].id, ratee_id: pair[1].id, score: 5, visible_at: null });
    expect(hidden.tags).toEqual(["On time", "Friendly"]);

    // Hidden ratings don't count yet; the completed trade does (PROF-02).
    expect(await profile(pair[1].handle)).toMatchObject({ rating: null, reviewCount: 0, tradeCount: 1 });

    await rate(pair[1], tradeId, { score: 4, tags: [] });
    const both = await ratingsOf(tradeId);
    expect(both.every((r) => r.visible_at !== null)).toBe(true);
    expect(await profile(pair[1].handle)).toMatchObject({ rating: 5, reviewCount: 1 });
    expect(await profile(pair[0].handle)).toMatchObject({ rating: 4, reviewCount: 1 });
  });

  it("only after completion, once, and only by the two people in the trade", async () => {
    const pending = await tradeBetween(ana, ben, "accepted");
    const early = await rate(ana, pending);
    expect(early.status).toBe(409);
    expect(early.body.error.code).toBe("TRADE_NOT_COMPLETED");

    const tradeId = await tradeBetween(ana, ben);
    expect((await rate(ana, tradeId)).status).toBe(201);
    const twice = await rate(ana, tradeId);
    expect(twice.status).toBe(409);
    expect(twice.body.error.code).toBe("ALREADY_RATED");

    const outsider = await rate(cy, tradeId);
    expect(outsider.status).toBe(403);
    expect(outsider.body.error.code).toBe("NOT_TRADE_MEMBER");
  });

  it("checks the score, tags, and note", async () => {
    const tradeId = await tradeBetween(ana, ben);
    for (const body of [
      { score: 0 },
      { score: 6 },
      { score: 4.5 },
      { score: 5, tags: ["Great haggler"] },
      { score: 5, tags: ["On time", "On time"] },
      { score: 5, note: "x".repeat(501) },
    ]) {
      expect((await rate(ana, tradeId, body)).body.error.code).toBe("VALIDATION_FAILED");
    }
    // The database refuses unknown tags even if the API were skipped.
    await expect(
      sql`insert into public.ratings (trade_id, rater_id, ratee_id, score, tags)
          values (${tradeId}, ${ana.id}, ${ben.id}, 5, ${"{Great haggler}"}::text[])`,
    ).rejects.toThrow(/ck_ratings_tags/);
  });
});

describe("revealing ratings (RATE-02)", () => {
  it("shows ratings that waited 7 days, and is safe to run twice", async () => {
    const old = await tradeBetween(ana, ben);
    const fresh = await tradeBetween(ana, ben);
    await sql`
      insert into public.ratings (trade_id, rater_id, ratee_id, score, created_at) values
        (${old}, ${ana.id}, ${ben.id}, 3, now() - interval '8 days'),
        (${fresh}, ${ana.id}, ${ben.id}, 3, now() - interval '6 days')`;

    const [run] = await sql`select app.ratings_reveal() as n`;
    expect(run.n).toBeGreaterThanOrEqual(1);
    expect((await ratingsOf(old))[0].visible_at).not.toBeNull();
    expect((await ratingsOf(fresh))[0].visible_at).toBeNull();

    // Nothing left that's due from these two.
    await sql`select app.ratings_reveal()`;
    expect((await ratingsOf(fresh))[0].visible_at).toBeNull();
  });

  it("is scheduled hourly with pg_cron", async () => {
    const [job] = await sql`select schedule, command from cron.job where jobname = 'ratings_reveal'`;
    expect(job).toEqual({ schedule: "0 * * * *", command: "select app.ratings_reveal()" });
  });
});

describe("after deletes", () => {
  it("keeps a rating when its author deletes their account", async () => {
    const leaver = await person("leaver");
    const tradeId = await tradeBetween(leaver, ben);
    await rate(leaver, tradeId);
    await deleteUsers([leaver.id]);

    const [kept] = await ratingsOf(tradeId);
    expect(kept).toMatchObject({ rater_id: null, ratee_id: ben.id });
  });

  it("can't rate someone who deleted their account", async () => {
    const leaver = await person("leaver2");
    const tradeId = await tradeBetween(leaver, ben);
    await deleteUsers([leaver.id]);

    const res = await rate(ben, tradeId);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });
});
