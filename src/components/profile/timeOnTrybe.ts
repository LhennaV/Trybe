// "Today", "12 d", "3 mo", "2 yr": how long someone has been on Trybe, from
// memberSince in the profile API. Plain TS, so server and client pages share it.
export function timeOnTrybe(memberSince: string, now: Date = new Date()) {
  const days = Math.floor((now.getTime() - new Date(memberSince).getTime()) / 86_400_000);
  if (days < 1) return "Today";
  if (days < 30) return `${days} d`;
  if (days < 365) return `${Math.floor(days / 30)} mo`;
  return `${Math.floor(days / 365)} yr`;
}
