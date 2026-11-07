import { describe, expect, it } from "vitest";
import { emailSchema, logInSchema, newPasswordSchema, signUpSchema } from "@/shared/contracts/auth";

const SIGN_UP = {
  email: "Tester1@Example.com ",
  password: "kiln-and-co-2026",
  displayName: "Test Kiln",
  handle: "Test_Kiln",
  acceptTerms: true,
  confirmAge: true,
};

describe("emailSchema", () => {
  it("trims and lowercases", () => {
    expect(emailSchema.parse("  Tester1@Example.COM ")).toBe("tester1@example.com");
  });

  it("rejects things that aren't emails", () => {
    for (const bad of ["", "tester1", "tester1@", "@example.com"]) {
      expect(emailSchema.safeParse(bad).success, bad).toBe(false);
    }
  });
});

describe("signUpSchema", () => {
  it("accepts a full sign up and normalizes email and handle", () => {
    const parsed = signUpSchema.parse(SIGN_UP);
    expect(parsed.email).toBe("tester1@example.com");
    expect(parsed.handle).toBe("test_kiln");
  });

  it("allows a missing captcha token (local dev)", () => {
    expect(signUpSchema.safeParse(SIGN_UP).success).toBe(true);
    expect(signUpSchema.safeParse({ ...SIGN_UP, captchaToken: "tok" }).success).toBe(true);
  });

  it("requires terms and age to be exactly true (AUTH-03, AUTH-04)", () => {
    for (const field of ["acceptTerms", "confirmAge"] as const) {
      expect(signUpSchema.safeParse({ ...SIGN_UP, [field]: false }).success, field).toBe(false);
      expect(signUpSchema.safeParse({ ...SIGN_UP, [field]: "true" }).success, field).toBe(false);
      const missing: Record<string, unknown> = { ...SIGN_UP };
      delete missing[field];
      expect(signUpSchema.safeParse(missing).success, field).toBe(false);
    }
  });

  it("rejects short passwords and unknown fields", () => {
    expect(signUpSchema.safeParse({ ...SIGN_UP, password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...SIGN_UP, emailVerified: true }).success).toBe(false);
  });
});

describe("logInSchema", () => {
  it("accepts any non-empty password", () => {
    expect(logInSchema.safeParse({ email: "a@example.com", password: "x" }).success).toBe(true);
    expect(logInSchema.safeParse({ email: "a@example.com", password: "" }).success).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("applies the password rules", () => {
    expect(newPasswordSchema.safeParse({ password: "12345678" }).success).toBe(true);
    expect(newPasswordSchema.safeParse({ password: "1234567" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "x".repeat(73) }).success).toBe(false);
  });
});
