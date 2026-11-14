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

// The symbols Supabase Auth counts as symbols. Using the same set means a
// password the form accepts is never refused by Supabase (decided 2026-11-14).
const PASSWORD_SYMBOLS = /[!@#$%^&*()_+\-=[\]{};'\\:"|<>?,./`~]/;

// Password rules for new passwords (sign up and reset), agreed by both owners
// 2026-11-14. They match Supabase Auth's "lower_upper_letters_digits_symbols"
// setting with a minimum length of 8, which enforces them a second time.
// The sign up form shows this list as a checklist.
export const PASSWORD_RULES = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN} characters`,
    problem: `Use at least ${PASSWORD_MIN} characters.`,
    test: (p: string) => p.length >= PASSWORD_MIN,
  },
  {
    id: "lower",
    label: "A lowercase letter",
    problem: "Add a lowercase letter.",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    id: "upper",
    label: "An uppercase letter",
    problem: "Add an uppercase letter.",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "number",
    label: "A number",
    problem: "Add a number.",
    test: (p: string) => /[0-9]/.test(p),
  },
  {
    id: "symbol",
    label: "A symbol, like ! or #",
    problem: "Add a symbol, like ! or #.",
    test: (p: string) => PASSWORD_SYMBOLS.test(p),
  },
] as const;

export const passwordSchema = z
  .string()
  .max(PASSWORD_MAX, `Use ${PASSWORD_MAX} characters or fewer.`)
  .superRefine((password, ctx) => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(password))
        ctx.addIssue({ code: "custom", message: rule.problem });
    }
  });

// The rules a password still misses, in order. Empty when it's good.
export function passwordProblems(password: string) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

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
  acceptTerms: z.literal(
    true,
    "Accept the Terms and Community Guidelines to join.",
  ),
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
export const signUpResultSchema = z.object({
  email: z.email(),
  needsVerification: z.literal(true),
});

// POST /api/auth/login
export const sessionUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  emailVerified: z.boolean(),
});

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
