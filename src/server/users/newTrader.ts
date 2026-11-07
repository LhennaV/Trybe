// "New trader" badge (PROF-04). Derived on read, never stored.
// A user keeps the badge until their account is old enough AND they have
// finished enough trades. Both numbers are Proposed; agree on them before launch.
export const NEW_TRADER_MIN_DAYS = 30;
export const NEW_TRADER_MIN_TRADES = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export function isNewTrader(
  { createdAt, completedTrades }: { createdAt: Date; completedTrades: number },
  now: Date = new Date(),
): boolean {
  const accountDays = (now.getTime() - createdAt.getTime()) / DAY_MS;
  return accountDays < NEW_TRADER_MIN_DAYS || completedTrades < NEW_TRADER_MIN_TRADES;
}
