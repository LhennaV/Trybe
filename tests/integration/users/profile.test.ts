import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET as getHobbies } from "@/app/api/hobbies/route";
import { GET as getMe, PATCH as patchMe } from "@/app/api/me/route";
import { GET as getUser } from "@/app/api/users/[handle]/route";
import { hobbyListSchema } from "@/shared/contracts/hobbies";
import { meSchema, publicProfileSchema } from "@/shared/contracts/users";
import { accessToken, apiRequest, createUser, deleteUsers, readJson, testSql } from "../helpers";

// The profile endpoints through their real route handlers, with a real
// bearer token and database: auth, validation, writes, and the audit trail.
const sql = testSql();
const created: string[] = [];
let me: Awaited<ReturnType<typeof createUser>>;
let token: string;
let hobbyIds: { pottery: string; crochet: string };

const userParams = (handle: string) => ({ params: Promise.resolve({ handle }) });

beforeAll(async () => {
  me = await createUser({ label: "profile" });
  created.push(me.id);
  token = await accessToken(me.email);
  const rows = await sql`select id, slug from public.hobbies where slug in ('pottery', 'crochet')`;
  const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r.id as string]));
  hobbyIds = { pottery: bySlug.pottery, crochet: bySlug.crochet };
});

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("GET /api/hobbies", () => {
  it("returns the seeded list, sorted by name", async () => {
    const { status, body } = await readJson(await getHobbies(apiRequest("/api/hobbies"), undefined));
    expect(status).toBe(200);
    const list = hobbyListSchema.parse(body.data);
    expect(list).toHaveLength(15);
    expect(list.map((h) => h.name)).toEqual([...list.map((h) => h.name)].sort());
  });
});

describe("GET /api/me", () => {
  it("returns 401 without a session", async () => {
    const { status, body } = await readJson(await getMe(apiRequest("/api/me"), undefined));
    expect(status).toBe(401);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns the signed-in user's profile for a bearer token", async () => {
    const { status, body } = await readJson(await getMe(apiRequest("/api/me", { token }), undefined));
    expect(status).toBe(200);
    expect(meSchema.parse(body.data)).toMatchObject({ id: me.id, handle: me.handle, emailVerified: true });
  });
});

describe("PATCH /api/me", () => {
  it("saves profile fields and replaces the hobby list", async () => {
    const response = await patchMe(
      apiRequest("/api/me", {
        method: "PATCH",
        token,
        body: {
          bio: "Wheel-thrown mugs.",
          city: "Quezon City",
          hobbies: [
            { hobbyId: hobbyIds.pottery, level: "has" },
            { hobbyId: hobbyIds.crochet, level: "trying" },
          ],
        },
      }),
      undefined,
    );
    const { status, body } = await readJson(response);

    expect(status).toBe(200);
    expect(body.data).toMatchObject({ bio: "Wheel-thrown mugs.", city: "Quezon City" });
    expect(body.data.hobbies.map((h: { slug: string; level: string }) => [h.slug, h.level])).toEqual([
      ["crochet", "trying"],
      ["pottery", "has"],
    ]);
  });

  it("records who made the change in the audit log", async () => {
    const [entry] = await sql`
      select actor_id from app.audit_log
      where table_name = 'users' and record_id = ${me.id} and action = 'UPDATE'
      order by changed_at desc limit 1`;
    expect(entry?.actor_id).toBe(me.id);
  });

  it("refuses a handle someone else has", async () => {
    const other = await createUser({ label: "other" });
    created.push(other.id);
    const response = await patchMe(apiRequest("/api/me", { method: "PATCH", token, body: { handle: other.handle } }), undefined);
    const { status, body } = await readJson(response);
    expect(status).toBe(409);
    expect(body.error.code).toBe("HANDLE_TAKEN");
  });

  it("refuses unknown hobbies and unknown fields", async () => {
    const unknownHobby = await patchMe(
      apiRequest("/api/me", {
        method: "PATCH",
        token,
        body: { hobbies: [{ hobbyId: "00000000-0000-4000-8000-000000000000", level: "has" }] },
      }),
      undefined,
    );
    expect((await readJson(unknownHobby)).body.error).toMatchObject({ code: "VALIDATION_FAILED" });

    const unknownField = await patchMe(
      apiRequest("/api/me", { method: "PATCH", token, body: { emailVerified: false } }),
      undefined,
    );
    expect(unknownField.status).toBe(400);
  });
});

describe("GET /api/users/:handle", () => {
  it("returns the public profile without private fields (PROF-07)", async () => {
    const { status, body } = await readJson(await getUser(apiRequest(`/api/users/${me.handle}`), userParams(me.handle)));
    expect(status).toBe(200);
    expect(publicProfileSchema.parse(body.data).handle).toBe(me.handle);
    for (const key of ["email", "emailVerified", "messagePermission", "suspendedAt"]) {
      expect(body.data).not.toHaveProperty(key);
    }
  });

  it("hides suspended accounts", async () => {
    const suspended = await createUser({ label: "susp" });
    created.push(suspended.id);
    await sql`update public.users set suspended_at = now() where id = ${suspended.id}`;

    const response = await getUser(apiRequest(`/api/users/${suspended.handle}`), userParams(suspended.handle));
    expect(response.status).toBe(404);
  });
});
