// Live checks for the sign up form. Plain TS (no React) so a native app can
// reuse them.

import { emailSchema, PASSWORD_MAX } from "@/shared/contracts/auth";
import { HANDLE_MAX } from "@/shared/contracts/users";
import { apiRequest } from "@/components/api/request";

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

// Stricter than the shared passwordSchema (8+ characters only). The server
// doesn't enforce these yet, so they live here until both owners agree to
// move them into src/shared/contracts/auth.ts.
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 && p.length <= PASSWORD_MAX },
  { id: "upper", label: "An uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "A number", test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol", label: "A symbol, like ! or #", test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

export function passwordProblems(password: string) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

// Common slips in the part after the @.
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "icloud.co": "icloud.com",
};

// "" when the email looks right. Our emailSchema needs a name, an @, and a
// domain with an ending (.com, .ph, .edu.ph...).
export function emailProblem(email: string): string {
  const value = email.trim();
  if (!value) return "Enter your email.";
  if (!value.includes("@")) return "Add the @ and the rest, like name@gmail.com.";
  const domain = value.split("@").pop()?.toLowerCase() ?? "";
  if (!domain) return "Add what comes after the @, like gmail.com.";
  if (!/\.[a-z]{2,}$/i.test(domain)) return "Add the ending, like .com or .ph.";
  const typo = DOMAIN_TYPOS[domain];
  if (typo) return `Did you mean ${value.slice(0, value.lastIndexOf("@") + 1)}${typo}?`;
  return emailSchema.safeParse(value).success ? "" : "Enter a valid email, like name@gmail.com.";
}

// ---------------------------------------------------------------------------
// Handle (made from the display name)
// ---------------------------------------------------------------------------

// GET /api/users/:handle answers 404 when nobody has it. Profiles are public,
// so this doesn't reveal anything a visit to the profile wouldn't.
export async function isHandleFree(handle: string): Promise<boolean | null> {
  const result = await apiRequest(`/api/users/${encodeURIComponent(handle)}`);
  if (result.ok) return false;
  return result.code === "NOT_FOUND" ? true : null; // null: couldn't check
}

function digits(count: number) {
  return String(Math.floor(Math.random() * 10 ** count)).padStart(count, "0");
}

// Other handles to offer when the first one is taken: numbers, then a word.
export function handleAlternatives(base: string): string[] {
  const fit = (suffix: string) => `${base.slice(0, HANDLE_MAX - suffix.length).replace(/\.+$/, "")}${suffix}`;
  return [fit(`_${digits(2)}`), fit(".makes"), fit(`_${digits(3)}`), fit(".trades"), fit(`.${digits(2)}`)];
}
