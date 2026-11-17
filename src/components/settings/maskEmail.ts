// "stormi@gmail.com" → "s•••@gmail.com". Settings is often seen over someone's
// shoulder, so the full address isn't shown. Plain TS so a native app can reuse it.
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at < 1) return "•••";
  return `${email[0]}•••${email.slice(at)}`;
}
