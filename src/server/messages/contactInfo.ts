// CHAT-04: does a message seem to ask for, or share, a way to talk outside
// Trybe? Only a warning: the message is still sent, and the app shows a
// "keep it in Trybe" banner. Catching most cases matters more than catching
// all of them, and a false alarm only shows a friendly banner.

// Phone numbers: Philippine mobiles (09xx, +639xx) and any long run of
// digits, allowing spaces, dots, and dashes between them.
const PHONE = /(?:\+?63|0)9\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|\d(?:[\s.-]?\d){9,}/;

const EMAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;

// Messaging apps and social accounts, as whole words.
const APPS =
  /\b(?:viber|whats\s?app|telegram|tg|messenger|fb|facebook|insta(?:gram)?|ig|tiktok|discord|wechat|line\s?app|signal app)\b/i;

// Asking for a number or an account, in English and Filipino.
const ASKS =
  /\b(?:(?:your|ur|ang|yung|'?yung)\s+(?:number|digits|cp|cell(?:phone)?)|number\s+mo|cp\s+mo|text\s+(?:me|mo\s+ako)|call\s+me|tawagan\s+mo|pm\s+(?:me|mo\s+ako)|dm\s+(?:me|mo\s+ako))\b/i;

export function asksForContact(text: string): boolean {
  return PHONE.test(text) || EMAIL.test(text) || APPS.test(text) || ASKS.test(text);
}
