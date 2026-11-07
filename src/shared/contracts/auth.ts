// Auth contract (TRD section 8.1). Draft: changes need agreement from both
// owners.

import { z } from "zod";
import { displayNameSchema, handleSchema } from "@/shared/contracts/users";

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email."));

// 72 is the most bcrypt (used by Supabase Auth) reads; longer is cut off.
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(PASSWORD_MAX, `Use ${PASSWORD_MAX} characters or fewer.`);

// The Cloudflare Turnstile token from the widget (AUTH-02). Optional here so
// local dev works without Turnstile; Supabase Auth enforces it once CAPTCHA
// is turned on for the project.
export const captchaTokenSchema = z.string().min(1).max(4096).optional();

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

// POST /api/auth/signup (AUTH-01, AUTH-03, AUTH-04)
export const signUpSchema = z.strictObject({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  handle: handleSchema,
  acceptTerms: z.literal(true, "Accept the Terms and Community Guidelines to join."),
  confirmAge: z.literal(true, "Confirm your age to join."),
  captchaToken: captchaTokenSchema,
});
export type SignUp = z.infer<typeof signUpSchema>;

// POST /api/auth/login. Any password length is accepted so old passwords
// still work if the rules change.
export const logInSchema = z.strictObject({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(PASSWORD_MAX),
  captchaToken: captchaTokenSchema,
});
export type LogIn = z.infer<typeof logInSchema>;

// POST /api/auth/password/forgot and POST /api/auth/verify/resend
export const emailRequestSchema = z.strictObject({
  email: emailSchema,
  captchaToken: captchaTokenSchema,
});
export type EmailRequest = z.infer<typeof emailRequestSchema>;

// POST /api/auth/password (signed in, for example after a reset link)
export const newPasswordSchema = z.strictObject({ password: passwordSchema });
export type NewPassword = z.infer<typeof newPasswordSchema>;

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

// POST /api/auth/signup. Same answer whether or not the email already has an
// account, so the form can't be used to find out who uses Trybe.
export const signUpResultSchema = z.object({ email: z.email(), needsVerification: z.literal(true) });

// POST /api/auth/login
export const sessionUserSchema = z.object({ id: z.uuid(), email: z.email(), emailVerified: z.boolean() });

// ---------------------------------------------------------------------------
// Email links
// ---------------------------------------------------------------------------

// Where GET /api/auth/confirm sends people after they click an email link.
// These are pages; the frontend owns them.
export const AUTH_REDIRECTS = {
  // Email verified, now signed in: continue onboarding.
  verified: "/onboarding/hobbies",
  // Password reset link opened, now signed in: pick a new password.
  recovery: "/reset-password",
  // Link expired or already used. The page reads ?error=link_invalid.
  invalidLink: "/login?error=link_invalid",
} as const;
