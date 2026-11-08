import { HANDLE_MAX, HANDLE_MIN } from "@/shared/contracts/users";

// Turns text into something that passes handleSchema: "Lhenna V." -> "lhenna.v".
// Returns "" when there's nothing usable.
function toHandle(text: string): string {
  const handle = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, HANDLE_MAX)
    .replace(/\.+$/, "");
  return handle.length >= HANDLE_MIN ? handle : "";
}

function randomDigits(count: number) {
  return String(Math.floor(Math.random() * 10 ** count)).padStart(count, "0");
}

// Usernames to try at sign up, best first, so people never have to invent
// one. Based on their name, then their email; numbered ones are fallbacks if
// the plain one is taken. They can change it later in Edit profile.
export function handleCandidates(displayName: string, email: string): string[] {
  const base = toHandle(displayName) || toHandle(email.split("@")[0] ?? "") || "trader";
  const stem = base.slice(0, HANDLE_MAX - 5).replace(/\.+$/, "");
  return [base, `${stem}_${randomDigits(2)}`, `${stem}_${randomDigits(4)}`];
}

// Email apps most people use. Lets "Check your email" open the inbox directly.
export function inboxLink(email: string): { label: string; href: string } | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return { label: "Open Gmail", href: "https://mail.google.com/mail/u/0/#search/from%3Atrybe" };
  }
  if (domain.startsWith("yahoo.") || domain === "ymail.com") {
    return { label: "Open Yahoo Mail", href: "https://mail.yahoo.com/" };
  }
  if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain)) {
    return { label: "Open Outlook", href: "https://outlook.live.com/mail/" };
  }
  if (domain === "icloud.com" || domain === "me.com") {
    return { label: "Open iCloud Mail", href: "https://www.icloud.com/mail" };
  }
  return null;
}
