import { describe, expect, it } from "vitest";
import { NEW_TRADER_MIN_DAYS, NEW_TRADER_MIN_TRADES, isNewTrader } from "@/server/users/newTrader";

const NOW = new Date("2026-11-07T00:00:00Z");
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);

describe("isNewTrader", () => {
  it("marks a brand new account as new", () => {
    expect(isNewTrader({ createdAt: NOW, completedTrades: 0 }, NOW)).toBe(true);
  });

  it("keeps the badge on an old account with too few trades", () => {
    expect(isNewTrader({ createdAt: daysAgo(365), completedTrades: NEW_TRADER_MIN_TRADES - 1 }, NOW)).toBe(true);
  });

  it("keeps the badge on a young account with many trades", () => {
    expect(isNewTrader({ createdAt: daysAgo(NEW_TRADER_MIN_DAYS - 1), completedTrades: 50 }, NOW)).toBe(true);
  });

  it("drops the badge once the account is old enough and has enough trades", () => {
    expect(
      isNewTrader({ createdAt: daysAgo(NEW_TRADER_MIN_DAYS), completedTrades: NEW_TRADER_MIN_TRADES }, NOW),
    ).toBe(false);
  });
});
