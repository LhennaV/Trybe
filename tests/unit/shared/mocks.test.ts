import { describe, expect, it } from "vitest";
import { hobbySchema } from "@/shared/contracts/hobbies";
import { categorySchema, itemSchema } from "@/shared/contracts/items";
import { postCardSchema, postDetailSchema } from "@/shared/contracts/posts";
import { messageSchema, tradeDetailSchema } from "@/shared/contracts/trades";
import { meSchema, userSummarySchema } from "@/shared/contracts/users";
import * as mocks from "@/shared/mocks";

// Implementation plan, Phase 0: "Mock data compiles against the shared
// contracts". TypeScript checks the shapes; these check the rules (uuids,
// urls, limits) the types can't.
describe("mock data matches the contracts", () => {
  const cases = [
    ["hobbies", Object.values(mocks.MOCK_HOBBIES), hobbySchema],
    ["categories", Object.values(mocks.MOCK_CATEGORIES), categorySchema],
    ["users", Object.values(mocks.MOCK_USERS), userSummarySchema],
    ["me", [mocks.MOCK_ME], meSchema],
    ["items", Object.values(mocks.MOCK_ITEMS), itemSchema],
    ["post details", Object.values(mocks.MOCK_POST_DETAILS), postDetailSchema],
    ["feed", mocks.MOCK_FEED, postCardSchema],
    ["trades", [mocks.MOCK_TRADE_PENDING, mocks.MOCK_TRADE_ACCEPTED], tradeDetailSchema],
    ["messages", mocks.MOCK_MESSAGES, messageSchema],
  ] as const;

  it.each(cases)("%s", (_name, values, schema) => {
    for (const value of values) {
      const result = schema.safeParse(value);
      expect(result.error?.issues ?? []).toEqual([]);
    }
  });

  it("uses the seeded hobby slugs", () => {
    const seeded = ["pottery", "film-photography", "crochet"];
    expect(Object.values(mocks.MOCK_HOBBIES).map((h) => h.slug)).toEqual(seeded);
  });

  it("keeps the feed cards free of detail-only fields", () => {
    for (const card of mocks.MOCK_FEED) {
      expect(card).not.toHaveProperty("caption");
      expect(card).not.toHaveProperty("items");
    }
  });

  it("points each trade's current offer at its last offer", () => {
    for (const trade of [mocks.MOCK_TRADE_PENDING, mocks.MOCK_TRADE_ACCEPTED]) {
      expect(trade.currentOffer).toEqual(trade.offers.at(-1));
    }
  });
});
