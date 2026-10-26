import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  ERROR_MESSAGES,
  ERROR_STATUS,
  apiErrorSchema,
  isErrorCode,
  pageQuerySchema,
  pageSchema,
} from "@/shared/contracts/common";

describe("error codes", () => {
  it("gives every code a user-safe default message", () => {
    expect(Object.keys(ERROR_MESSAGES).sort()).toEqual(Object.keys(ERROR_STATUS).sort());
  });

  it("recognizes known codes and rejects anything else", () => {
    expect(isErrorCode("TRADE_NOT_PENDING")).toBe(true);
    expect(isErrorCode("trade_not_pending")).toBe(false);
    expect(isErrorCode("toString")).toBe(false);
    expect(isErrorCode(42)).toBe(false);
  });
});

describe("apiErrorSchema", () => {
  it("accepts the standard error shape", () => {
    const body = { error: { code: "ITEM_NOT_AVAILABLE", message: "Gone." } };
    expect(apiErrorSchema.parse(body)).toEqual(body);
  });

  it("rejects an unknown error code", () => {
    expect(apiErrorSchema.safeParse({ error: { code: "NOPE", message: "x" } }).success).toBe(false);
  });
});

describe("pageQuerySchema", () => {
  it("defaults the limit to 20", () => {
    expect(pageQuerySchema.parse({})).toEqual({ limit: 20 });
  });

  it("coerces the limit from a query string", () => {
    expect(pageQuerySchema.parse({ cursor: "abc", limit: "5" })).toEqual({ cursor: "abc", limit: 5 });
  });

  it.each(["0", "51", "2.5", "ten"])("rejects limit=%s", (limit) => {
    expect(pageQuerySchema.safeParse({ limit }).success).toBe(false);
  });

  it("rejects unknown params", () => {
    expect(pageQuerySchema.safeParse({ sort: "new" }).success).toBe(false);
  });

  it("lets endpoints add their own filters", () => {
    const feedQuery = pageQuerySchema.extend({ hobby: z.string().optional() });
    expect(feedQuery.parse({ hobby: "pottery" })).toEqual({ hobby: "pottery", limit: 20 });
  });
});

describe("pageSchema", () => {
  it("accepts a last page with a null cursor", () => {
    const schema = pageSchema(z.object({ id: z.string() }));
    expect(schema.parse({ items: [{ id: "a" }], nextCursor: null })).toEqual({ items: [{ id: "a" }], nextCursor: null });
  });
});
