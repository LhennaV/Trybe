import { AuthApiError, AuthRetryableFetchError, AuthSessionMissingError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bearerToken, getSessionUser, requireUser } from "@/server/auth/session";

// Supabase and Next's cookies() are faked: these tests check how the server
// reads a session, not Supabase itself.
const { tokenGetUser, cookieGetUser } = vi.hoisted(() => ({ tokenGetUser: vi.fn(), cookieGetUser: vi.fn() }));

vi.mock("@supabase/supabase-js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@supabase/supabase-js")>()),
  createClient: () => ({ auth: { getUser: tokenGetUser } }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: cookieGetUser } }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

const AUTH_USER = { id: "u1", email: "tester1@example.com", email_confirmed_at: "2026-11-01T00:00:00Z" };
const request = (headers: Record<string, string> = {}) => new Request("http://localhost/api/me", { headers });
const loggedOut = { data: { user: null }, error: new AuthSessionMissingError() };

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
  tokenGetUser.mockReset();
  cookieGetUser.mockReset();
});

describe("bearerToken", () => {
  it("reads the token from the Authorization header", () => {
    expect(bearerToken(request({ authorization: "Bearer abc.def" }))).toBe("abc.def");
    expect(bearerToken(request({ authorization: "bearer abc" }))).toBe("abc");
  });

  it("ignores a missing or malformed header", () => {
    expect(bearerToken(request())).toBeNull();
    expect(bearerToken(request({ authorization: "Basic abc" }))).toBeNull();
    expect(bearerToken(request({ authorization: "Bearer" }))).toBeNull();
  });
});

describe("getSessionUser", () => {
  it("uses the bearer token when one is sent, not cookies", async () => {
    tokenGetUser.mockResolvedValue({ data: { user: AUTH_USER }, error: null });
    const user = await getSessionUser(request({ authorization: "Bearer t" }));
    expect(tokenGetUser).toHaveBeenCalledWith("t");
    expect(cookieGetUser).not.toHaveBeenCalled();
    expect(user).toEqual({ id: "u1", email: "tester1@example.com", emailVerified: true });
  });

  it("uses cookies when there is no bearer token", async () => {
    cookieGetUser.mockResolvedValue({ data: { user: { ...AUTH_USER, email_confirmed_at: undefined } }, error: null });
    expect(await getSessionUser(request())).toEqual({ id: "u1", email: "tester1@example.com", emailVerified: false });
  });

  it("treats a missing or rejected session as logged out", async () => {
    cookieGetUser.mockResolvedValue(loggedOut);
    expect(await getSessionUser(request())).toBeNull();

    tokenGetUser.mockResolvedValue({ data: { user: null }, error: new AuthApiError("bad jwt", 403, "bad_jwt") });
    expect(await getSessionUser(request({ authorization: "Bearer t" }))).toBeNull();
  });

  it("throws when Supabase Auth is down instead of logging the user out", async () => {
    cookieGetUser.mockResolvedValue({ data: { user: null }, error: new AuthRetryableFetchError("fetch failed", 0) });
    await expect(getSessionUser(request())).rejects.toThrow("fetch failed");

    cookieGetUser.mockResolvedValue({ data: { user: null }, error: new AuthApiError("oops", 500, undefined) });
    await expect(getSessionUser(request())).rejects.toThrow("oops");
  });
});

describe("requireUser", () => {
  it("throws UNAUTHENTICATED when logged out", async () => {
    cookieGetUser.mockResolvedValue(loggedOut);
    await expect(requireUser(request())).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
  });

  it("returns the user when signed in", async () => {
    cookieGetUser.mockResolvedValue({ data: { user: AUTH_USER }, error: null });
    await expect(requireUser(request())).resolves.toMatchObject({ id: "u1" });
  });
});
