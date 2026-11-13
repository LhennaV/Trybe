import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { accessToken, anonClient, createUser, deleteUsers } from "../helpers";

// Row Level Security (docs/testing.md section 7.4, docs/database.md section 10).
// The browser has the public anon key, so these use it exactly like a browser
// would: no service role, no server connection.
const TABLES = [
  "users",
  "hobbies",
  "user_hobbies",
  "hobby_requests",
  "categories",
  "photos",
  "items",
  "item_photos",
  "posts",
  "post_photos",
  "post_items",
  "likes",
  "saves",
] as const;
const created: string[] = [];
let signedIn: ReturnType<typeof anonClient>;

beforeAll(async () => {
  const user = await createUser({ label: "rls" });
  created.push(user.id);
  const token = await accessToken(user.email);
  signedIn = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
});

afterAll(async () => {
  await deleteUsers(created);
});

describe.each([
  ["a logged-out browser", () => anonClient()],
  ["a logged-in browser", () => signedIn],
])("%s", (_who, client) => {
  it.each(TABLES)("reads no rows from %s", async (table) => {
    const { data } = await client().from(table).select("*").limit(5);
    expect(data ?? []).toEqual([]);
  });

  it.each(TABLES)("can't insert into %s", async (table) => {
    const { error } = await client().from(table).insert({});
    expect(error).not.toBeNull();
  });

  it("can't reach the private app schema", async () => {
    const { error } = await client().schema("app").from("audit_log").select("*").limit(1);
    expect(error).not.toBeNull();
  });
});
