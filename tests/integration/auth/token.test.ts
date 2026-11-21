import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { POST as logoutRoute } from "@/app/api/auth/logout/route";
import { POST as tokenRoute } from "@/app/api/auth/token/route";
import { GET as meRoute } from "@/app/api/me/route";
import { authSessionSchema } from "@/shared/contracts/auth";
import { PASSWORD, anonClient, apiRequest, cookieJar, createUser, deleteUsers, readJson } from "../helpers";

// Log in for the mobile app (POST /api/auth/token, decided 2026-11-21): the
// session comes back in the body, never as cookies, and works as a Bearer
// token on the rest of the API.
const created: string[] = [];
let person: Awaited<ReturnType<typeof createUser>>;

async function token(body: unknown) {
  return readJson(await tokenRoute(apiRequest("/api/auth/token", { method: "POST", body }), undefined));
}

beforeAll(async () => {
  person = await createUser({ label: "app" });
  created.push(person.id);
});

afterAll(async () => {
  await deleteUsers(created);
});

describe("POST /api/auth/token", () => {
  it("returns a session that works as a Bearer token, without setting cookies", async () => {
    cookieJar().clear();
    const res = await token({ email: person.email, password: PASSWORD });
    expect(res.status).toBe(200);
    const { user, session } = authSessionSchema.parse(res.body.data);
    expect(user).toEqual({ id: person.id, email: person.email, emailVerified: true });
    expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now());
    expect([...cookieJar().keys()].filter((name) => name.startsWith("sb-"))).toEqual([]);

    const me = await readJson(await meRoute(apiRequest("/api/me", { token: session.accessToken }), undefined));
    expect(me.status).toBe(200);
    expect(me.body.data.id).toBe(person.id);

    // The app refreshes through supabase-js with the refresh token.
    const { data, error } = await anonClient().auth.refreshSession({ refresh_token: session.refreshToken });
    expect(error).toBeNull();
    expect(data.session?.access_token).toBeTruthy();
  });

  it("refuses a wrong password and an unverified email", async () => {
    const wrong = await token({ email: person.email, password: "Not-the-password-1!" });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error.code).toBe("INVALID_CREDENTIALS");

    const unverified = await createUser({ label: "appunv", verified: false });
    created.push(unverified.id);
    const res = await token({ email: unverified.email, password: PASSWORD });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("EMAIL_NOT_VERIFIED");

    expect((await token({ email: person.email })).status).toBe(400);
  });
});

describe("POST /api/auth/logout with a Bearer token", () => {
  it("ends that session, so its refresh token stops working", async () => {
    const { session } = authSessionSchema.parse((await token({ email: person.email, password: PASSWORD })).body.data);

    const res = await readJson(
      await logoutRoute(apiRequest("/api/auth/logout", { method: "POST", token: session.accessToken }), undefined),
    );
    expect(res.status).toBe(200);

    const { error } = await anonClient().auth.refreshSession({ refresh_token: session.refreshToken });
    expect(error).not.toBeNull();

    // Logging out again is fine.
    const again = await logoutRoute(
      apiRequest("/api/auth/logout", { method: "POST", token: session.accessToken }),
      undefined,
    );
    expect(again.status).toBe(200);
  });
});
