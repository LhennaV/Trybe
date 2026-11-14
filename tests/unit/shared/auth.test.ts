import { describe, expect, it } from "vitest";
import { emailSchema, logInSchema, newPasswordSchema, passwordProblems, signUpSchema } from "@/shared/contracts/auth";

const SIGN_UP = {
  email: "Tester1@Example.com ",
  password: "Kiln-and-co-2026",
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

describe("password rules (agreed 2026-11-14, same as Supabase)", () => {
  it("accepts a password with every kind of character", () => {
    for (const good of ["Kiln-and-co-2026", "Aa1!aaaa", "Test-password-123!", "Brand-new-password-456!"]) {
      expect(newPasswordSchema.safeParse({ password: good }).success, good).toBe(true);
    }
  });

  it.each([
    ["Aa1!aaa", "length"],
    ["AA1!AAAA", "lower"],
    ["aa1!aaaa", "upper"],
    ["Aa!aaaaa", "number"],
    ["Aa1aaaaa", "symbol"],
  ])("refuses %s (missing %s)", (password, missing) => {
    expect(newPasswordSchema.safeParse({ password }).success).toBe(false);
    expect(passwordProblems(password).map((rule) => rule.id)).toEqual([missing]);
  });

  it("only counts the symbols Supabase counts", () => {
    // A letter Supabase doesn't treat as a symbol must not tick the box.
    expect(passwordProblems("Aa1ñaaaa").map((rule) => rule.id)).toEqual(["symbol"]);
  });

  it("refuses passwords longer than bcrypt reads", () => {
    expect(newPasswordSchema.safeParse({ password: `Aa1!${"x".repeat(69)}` }).success).toBe(false);
  });

  it("gives one message per missing rule, for the form", () => {
    const result = newPasswordSchema.safeParse({ password: "abc" });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Use at least 8 characters.",
      "Add an uppercase letter.",
      "Add a number.",
      "Add a symbol, like ! or #.",
    ]);
  });

  it("still lets old passwords log in", () => {
    // Log in never applies the new rules, or accounts made before them would be locked out.
    expect(logInSchema.safeParse({ email: "a@example.com", password: "oldpass1" }).success).toBe(true);
  });
});
