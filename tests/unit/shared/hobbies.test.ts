import { describe, expect, it } from "vitest";
import { hobbyLevelSchema, hobbyListSchema } from "@/shared/contracts/hobbies";

describe("hobbyLevelSchema", () => {
  it("accepts has and trying only", () => {
    expect(hobbyLevelSchema.parse("has")).toBe("has");
    expect(hobbyLevelSchema.parse("trying")).toBe("trying");
    expect(hobbyLevelSchema.safeParse("expert").success).toBe(false);
  });
});

describe("hobbyListSchema", () => {
  it("accepts the GET /api/hobbies shape", () => {
    const list = [{ id: "5b3f6c1e-2a4d-4c8b-9e7f-1a2b3c4d5e6f", name: "Pottery", slug: "pottery" }];
    expect(hobbyListSchema.parse(list)).toEqual(list);
  });

  it("rejects a hobby without a valid id", () => {
    expect(hobbyListSchema.safeParse([{ id: "1", name: "Pottery", slug: "pottery" }]).success).toBe(false);
  });
});
