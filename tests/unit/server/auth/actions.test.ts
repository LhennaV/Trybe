import { AuthApiError, AuthError, AuthSessionMissingError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_REDIRECTS } from "@/shared/contracts/auth";
import {
  confirmEmailLink,
  logIn,
  logOut,
  resendVerification,
  sendPasswordReset,
  setPassword,
  signUp,
} from "@/server/auth/actions";
import { toAuthAppError } from "@/server/auth/errors";
import { AppError } from "@/server/errors";

// Supabase clients and the database are faked. These tests check our rules
// around Supabase Auth, not Supabase itself.
const { auth, admin, handleRows } = vi.hoisted(() => ({
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    resend: vi.fn(),
    verifyOtp: vi.fn(),
  },
  admin: { updateUserById: vi.fn() },
  // Rows returned by the "is this handle taken?" query, one array per call.
  handleRows: [] as { id: string }[][],
}));

vi.mock("@/server/auth/supabase", () => ({
  createAnonClient: () => ({ auth }),
  createCookieClient: async () => ({ auth }),
  createAdminClient: () => ({ auth: { admin } }),
}));
vi.mock("@/server/db", () => ({
  getDb: () => ({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => handleRows.shift() ?? [] }) }) }),
  }),
}));

const SIGN_UP = {
  email: "tester1@example.com",
  password: "kiln-and-co-2026",
  displayName: "Test Kiln",
  handle: "test_kiln",
  acceptTerms: true as const,
  confirmAge: true as const,
  captchaToken: "tok",
};
const USER = { id: "u1", email: "tester1@example.com", emailVerified: true };
const okResult = { data: {}, error: null };
const authError = (code: string, status = 400) => new AuthApiError(code, status, code);

beforeEach(() => {
  vi.clearAllMocks();
  handleRows.length = 0;
});

describe("signUp", () => {
  it("passes terms, age, handle, and the captcha token to Supabase", async () => {
    auth.signUp.mockResolvedValue(okResult);
    expect(await signUp(SIGN_UP)).toEqual({ email: SIGN_UP.email, needsVerification: true });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: SIGN_UP.email,
      password: SIGN_UP.password,
      options: {
        captchaToken: "tok",
        data: { display_name: "Test Kiln", handle: "test_kiln", terms_accepted: true, age_confirmed: true },
      },
    });
  });

  it("refuses a taken handle before calling Supabase", async () => {
    handleRows.push([{ id: "someone" }]);
    await expect(signUp(SIGN_UP)).rejects.toMatchObject({ code: "HANDLE_TAKEN" });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("reports HANDLE_TAKEN when another sign up took the handle first", async () => {
    handleRows.push([], [{ id: "someone" }]);
    auth.signUp.mockResolvedValue({ data: {}, error: authError("unexpected_failure", 500) });
    await expect(signUp(SIGN_UP)).rejects.toMatchObject({ code: "HANDLE_TAKEN" });
  });

  it("maps a failed captcha", async () => {
    auth.signUp.mockResolvedValue({ data: {}, error: authError("captcha_failed") });
    await expect(signUp(SIGN_UP)).rejects.toMatchObject({ code: "CAPTCHA_FAILED" });
  });
});

describe("logIn", () => {
  it("returns the signed-in user", async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "u1", email: "tester1@example.com", email_confirmed_at: "2026-11-01T00:00:00Z" } },
      error: null,
    });
    expect(await logIn({ email: "tester1@example.com", password: "x" })).toEqual(USER);
  });

  it("maps wrong passwords and unverified emails", async () => {
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: authError("invalid_credentials") });
    await expect(logIn({ email: "a@example.com", password: "x" })).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS",
    });

    auth.signInWithPassword.mockResolvedValue({ data: {}, error: authError("email_not_confirmed") });
    await expect(logIn({ email: "a@example.com", password: "x" })).rejects.toMatchObject({
      code: "EMAIL_NOT_VERIFIED",
    });
  });
});

describe("logOut", () => {
  it("is fine when already logged out", async () => {
    auth.signOut.mockResolvedValue({ error: new AuthSessionMissingError() });
    await expect(logOut()).resolves.toBeUndefined();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});

describe("emails", () => {
  it("sends reset and verification emails with the captcha token", async () => {
    auth.resetPasswordForEmail.mockResolvedValue(okResult);
    auth.resend.mockResolvedValue(okResult);
    await sendPasswordReset({ email: "a@example.com", captchaToken: "tok" });
    await resendVerification({ email: "a@example.com", captchaToken: "tok" });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("a@example.com", { captchaToken: "tok" });
    expect(auth.resend).toHaveBeenCalledWith({ type: "signup", email: "a@example.com", options: { captchaToken: "tok" } });
  });

  it("maps email rate limits", async () => {
    auth.resend.mockResolvedValue({ error: authError("over_email_send_rate_limit", 429) });
    await expect(resendVerification({ email: "a@example.com" })).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });
});

describe("setPassword", () => {
  it("updates only the signed-in user's password", async () => {
    admin.updateUserById.mockResolvedValue(okResult);
    await setPassword(USER, "new-password-1");
    expect(admin.updateUserById).toHaveBeenCalledWith("u1", { password: "new-password-1" });
  });
});

describe("confirmEmailLink", () => {
  it("sends verified people to onboarding and reset links to the new password page", async () => {
    auth.verifyOtp.mockResolvedValue(okResult);
    expect(await confirmEmailLink("hash", "email")).toBe(AUTH_REDIRECTS.verified);
    expect(await confirmEmailLink("hash", "signup")).toBe(AUTH_REDIRECTS.verified);
    expect(await confirmEmailLink("hash", "recovery")).toBe(AUTH_REDIRECTS.recovery);
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "hash", type: "recovery" });
  });

  it("refuses missing or unknown link details without calling Supabase", async () => {
    expect(await confirmEmailLink(null, "email")).toBe(AUTH_REDIRECTS.invalidLink);
    expect(await confirmEmailLink("hash", "magiclink")).toBe(AUTH_REDIRECTS.invalidLink);
    expect(await confirmEmailLink("hash", null)).toBe(AUTH_REDIRECTS.invalidLink);
    expect(auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("treats an expired or used link as invalid", async () => {
    auth.verifyOtp.mockResolvedValue({ data: {}, error: authError("otp_expired", 403) });
    expect(await confirmEmailLink("hash", "email")).toBe(AUTH_REDIRECTS.invalidLink);
  });
});

describe("toAuthAppError", () => {
  it("passes unknown errors through so they reach Sentry", () => {
    const unknown = authError("something_new");
    expect(toAuthAppError(unknown)).toBe(unknown);
    const plain = new Error("boom");
    expect(toAuthAppError(plain)).toBe(plain);
  });

  it("maps weak passwords to a field error", () => {
    const error = toAuthAppError(new AuthError("weak", 422, "weak_password")) as AppError;
    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.fields).toHaveProperty("password");
  });
});
