import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

// Shared helpers for integration tests. Everything here talks to the local
// Supabase stack (tests/integration/setup.ts refuses anything else).

const NO_SESSION = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };

export const PASSWORD = "test-password-123";

export function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: NO_SESSION,
  });
}

export function anonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: NO_SESSION,
  });
}

// Direct SQL for checking what landed in the database. Close it in afterAll.
export function testSql() {
  return postgres(process.env.DIRECT_DATABASE_URL!, { max: 1, prepare: false });
}

// Unique per call so tests never collide, and obviously fake (docs/testing.md section 6).
export function uniqueUser(label = "user") {
  const suffix = randomBytes(4).toString("hex");
  return {
    email: `${label}.${suffix}@example.test`,
    handle: `it_${label.slice(0, 6)}_${suffix}`.slice(0, 20),
    displayName: `Test ${label}`,
  };
}

// Creates an account the same way sign up does (the profile trigger runs),
// already verified unless `verified: false`.
export async function createUser(options: { label?: string; verified?: boolean } = {}) {
  const user = uniqueUser(options.label);
  const { data, error } = await adminClient().auth.admin.createUser({
    email: user.email,
    password: PASSWORD,
    email_confirm: options.verified ?? true,
    user_metadata: {
      display_name: user.displayName,
      handle: user.handle,
      terms_accepted: true,
      age_confirmed: true,
    },
  });
  if (error) throw error;
  return { ...user, id: data.user.id };
}

// A real access token for `Authorization: Bearer`, like a native client sends.
export async function accessToken(email: string) {
  const { data, error } = await anonClient().auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw error;
  return data.session.access_token;
}

// Deletes test accounts. The users row and its hobbies go with them (cascade).
export async function deleteUsers(ids: string[]) {
  const admin = adminClient();
  for (const id of ids) await admin.auth.admin.deleteUser(id);
}

export function cookieJar() {
  return (globalThis as { testCookieJar?: Map<string, string> }).testCookieJar!;
}

// Builds a request for a route handler.
export function apiRequest(path: string, init: { method?: string; token?: string; body?: unknown } = {}) {
  const headers: Record<string, string> = {};
  if (init.token) headers.authorization = `Bearer ${init.token}`;
  if (init.body !== undefined) headers["content-type"] = "application/json";
  return new Request(`http://localhost${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

export async function readJson(response: Response) {
  return { status: response.status, body: await response.json() };
}
