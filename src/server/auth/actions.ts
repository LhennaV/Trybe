import "server-only";
import { isAuthApiError, isAuthSessionMissingError, type EmailOtpType } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { AUTH_REDIRECTS, type EmailRequest, type LogIn, type SignUp } from "@/shared/contracts/auth";
import { toAuthAppError } from "@/server/auth/errors";
import type { SessionUser } from "@/server/auth/session";
import { createAdminClient, createAnonClient, createCookieClient } from "@/server/auth/supabase";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { AppError } from "@/server/errors";

async function handleIsTaken(handle: string) {
  const [row] = await getDb().select({ id: users.id }).from(users).where(eq(users.handle, handle)).limit(1);
  return Boolean(row);
}

function handleTakenError() {
  return new AppError("HANDLE_TAKEN", undefined, { handle: ["Someone already has that handle."] });
}

// Sign up (AUTH-01, AUTH-03, AUTH-04). Supabase Auth creates the account and
// emails the verification link. The trg_auth_users_create_profile trigger
// creates the users row in the same transaction and refuses the sign up if
// terms or age weren't confirmed, even when someone calls Supabase directly.
export async function signUp(input: SignUp) {
  // Checked first for a friendly error. The unique index still catches a
  // race between two sign ups with the same handle.
  if (await handleIsTaken(input.handle)) throw handleTakenError();

  const { error } = await createAnonClient().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      captchaToken: input.captchaToken,
      data: {
        display_name: input.displayName,
        handle: input.handle,
        terms_accepted: input.acceptTerms,
        age_confirmed: input.confirmAge,
      },
    },
  });

  if (error) {
    // The profile trigger failed. The likely cause is the handle race above.
    if (isAuthApiError(error) && error.status >= 500 && (await handleIsTaken(input.handle))) {
      throw handleTakenError();
    }
    throw toAuthAppError(error);
  }

  // An email that already has an account gets the same answer, on purpose.
  return { email: input.email, needsVerification: true as const };
}

// Log in (AUTH-06). Sets the session cookies on the response. Unverified
// accounts are refused with EMAIL_NOT_VERIFIED.
export async function logIn(input: LogIn): Promise<SessionUser> {
  const supabase = await createCookieClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
    options: { captchaToken: input.captchaToken },
  });
  if (error) throw toAuthAppError(error);

  const { user } = data;
  return { id: user.id, email: user.email ?? input.email, emailVerified: Boolean(user.email_confirmed_at) };
}

// Log out this device (AUTH-06). Safe to call when already logged out.
export async function logOut() {
  const supabase = await createCookieClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error && !isAuthSessionMissingError(error)) throw toAuthAppError(error);
}

// Emails a password reset link (AUTH-06). Always answers the same way, so it
// can't be used to find out whether an email has an account.
export async function sendPasswordReset(input: EmailRequest) {
  const { error } = await createAnonClient().auth.resetPasswordForEmail(input.email, {
    captchaToken: input.captchaToken,
  });
  if (error) throw toAuthAppError(error);
}

// Sends the verification email again (AUTH-05).
export async function resendVerification(input: EmailRequest) {
  const { error } = await createAnonClient().auth.resend({
    type: "signup",
    email: input.email,
    options: { captchaToken: input.captchaToken },
  });
  if (error) throw toAuthAppError(error);
}

// Sets a new password for the signed-in user, for example after opening a
// reset link. Uses the admin API so it works for cookie and bearer sessions;
// the caller must have passed requireUser() first.
export async function setPassword(user: SessionUser, password: string) {
  const { error } = await createAdminClient().auth.admin.updateUserById(user.id, { password });
  if (error) throw toAuthAppError(error);
}

// Link types our email templates send.
const LINK_TYPES = ["email", "signup", "recovery", "email_change"] as const satisfies readonly EmailOtpType[];
type LinkType = (typeof LINK_TYPES)[number];

export function isLinkType(value: string | null): value is LinkType {
  return (LINK_TYPES as readonly string[]).includes(value ?? "");
}

// Handles a link from a Supabase email: checks it, signs the person in, and
// says which page to send them to. Never redirects anywhere else, so the link
// can't be turned into an open redirect.
export async function confirmEmailLink(tokenHash: string | null, type: string | null): Promise<string> {
  if (!tokenHash || !isLinkType(type)) return AUTH_REDIRECTS.invalidLink;

  const supabase = await createCookieClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    if (isAuthApiError(error) && error.status >= 500) throw error;
    return AUTH_REDIRECTS.invalidLink;
  }

  return type === "recovery" ? AUTH_REDIRECTS.recovery : AUTH_REDIRECTS.verified;
}
