import { afterAll, describe, expect, it } from "vitest";
import { confirmEmailLink, logIn, signUp } from "@/server/auth/actions";
import { AUTH_REDIRECTS } from "@/shared/contracts/auth";
import {
  PASSWORD,
  adminClient,
  anonClient,
  cookieJar,
  createUser,
  deleteUsers,
  testSql,
  uniqueUser,
} from "../helpers";

// Sign up, the profile trigger (migration 0004), verification, and log in,
// against real Supabase Auth and Postgres.
const sql = testSql();
const created: string[] = [];

async function profileByEmail(email: string) {
  const [row] = await sql`
    select u.*, a.email_confirmed_at
    from public.users u join auth.users a on a.id = u.id
    where a.email = ${email}`;
  if (row) created.push(row.id);
  return row;
}

afterAll(async () => {
  await deleteUsers(created);
  await sql.end();
});

describe("sign up (AUTH-01, AUTH-03, AUTH-04)", () => {
  it("creates the account and its profile with terms and age times", async () => {
    const user = uniqueUser("signup");
    const result = await signUp({ ...user, password: PASSWORD, acceptTerms: true, confirmAge: true });
    expect(result).toEqual({ email: user.email, needsVerification: true });

    const row = await profileByEmail(user.email);
    expect(row).toMatchObject({ handle: user.handle, display_name: user.displayName, email_verified: false });
    expect(row.terms_accepted_at).toBeInstanceOf(Date);
    expect(row.age_confirmed_at).toBeInstanceOf(Date);
  });

  it("refuses a handle someone already has", async () => {
    const existing = await createUser({ label: "taken" });
    created.push(existing.id);
    const user = uniqueUser("dupe");

    await expect(
      signUp({ ...user, handle: existing.handle, password: PASSWORD, acceptTerms: true, confirmAge: true }),
    ).rejects.toMatchObject({ code: "HANDLE_TAKEN" });
    expect(await profileByEmail(user.email)).toBeUndefined();
  });

  it("refuses a direct Supabase sign up that skips terms and age", async () => {
    const user = uniqueUser("direct");
    const { error } = await anonClient().auth.signUp({
      email: user.email,
      password: PASSWORD,
      options: { data: { display_name: user.displayName, handle: user.handle } },
    });

    expect(error).not.toBeNull();
    const [account] = await sql`select id from auth.users where email = ${user.email}`;
    expect(account).toBeUndefined();
  });
});

describe("verification and log in (AUTH-05, AUTH-06)", () => {
  it("copies email verification to the profile", async () => {
    const user = await createUser({ label: "verify", verified: false });
    created.push(user.id);

    await adminClient().auth.admin.updateUserById(user.id, { email_confirm: true });
    const row = await profileByEmail(user.email);
    expect(row.email_verified).toBe(true);
  });

  it("refuses unverified accounts and wrong passwords", async () => {
    const user = await createUser({ label: "unverif", verified: false });
    created.push(user.id);

    await expect(logIn({ email: user.email, password: PASSWORD })).rejects.toMatchObject({
      code: "EMAIL_NOT_VERIFIED",
    });
    await expect(logIn({ email: user.email, password: "wrong-password" })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });
  });

  it("logs a verified user in and sets the session cookies", async () => {
    const user = await createUser({ label: "login" });
    created.push(user.id);
    cookieJar().clear();

    const session = await logIn({ email: user.email, password: PASSWORD });
    expect(session).toEqual({ id: user.id, email: user.email, emailVerified: true });
    expect(cookieJar().size).toBeGreaterThan(0);
  });

  it("sends an invalid or used link to the login page", async () => {
    expect(await confirmEmailLink("not-a-real-token", "email")).toBe(AUTH_REDIRECTS.invalidLink);
  });
});
