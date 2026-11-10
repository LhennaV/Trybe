import { describe, expect, it } from "vitest";
import {
  HOBBIES_PER_USER_MAX,
  OTHER_HOBBIES_MAX,
  OTHER_HOBBY_NAME_MAX,
  bioSchema,
  citySchema,
  displayNameSchema,
  handleSchema,
  meSchema,
  publicProfileSchema,
  updateMeSchema,
} from "@/shared/contracts/users";

const HOBBY_A = "5b3f6c1e-2a4d-4c8b-9e7f-1a2b3c4d5e6f";
const HOBBY_B = "6c4a7d2f-3b5e-4d9c-8f1a-2b3c4d5e6f70";

describe("handleSchema", () => {
  it("lowercases and trims before checking", () => {
    expect(handleSchema.parse("  Test_Kiln ")).toBe("test_kiln");
  });

  it("accepts 3 to 20 letters, numbers, underscores, and dots between them", () => {
    for (const good of ["abc", "a".repeat(20), "kiln.and.co", "mika.makes", "test_kiln", "_test_", "film.by.jo2"]) {
      expect(handleSchema.safeParse(good).success, good).toBe(true);
    }
  });

  it("rejects handles that are too short, too long, or have other characters", () => {
    for (const bad of ["ab", "a".repeat(21), "test-kiln", "test kiln", "tëst", "@test"]) {
      expect(handleSchema.safeParse(bad).success, bad).toBe(false);
    }
  });

  it("rejects dots at the ends or next to each other", () => {
    for (const bad of [".kiln", "kiln.", "kiln..co", "..."]) {
      expect(handleSchema.safeParse(bad).success, bad).toBe(false);
    }
  });
});

describe("profile fields", () => {
  it("requires a display name after trimming", () => {
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
    expect(displayNameSchema.parse(" Storm ")).toBe("Storm");
  });

  it("allows an empty bio, which clears it", () => {
    expect(bioSchema.parse("")).toBe("");
    expect(bioSchema.safeParse("x".repeat(161)).success).toBe(false);
  });

  it("requires a city when one is sent", () => {
    expect(citySchema.safeParse("").success).toBe(false);
    expect(citySchema.parse("Quezon City")).toBe("Quezon City");
  });
});

describe("updateMeSchema", () => {
  it("accepts a partial update", () => {
    expect(updateMeSchema.parse({ city: "Makati" })).toEqual({ city: "Makati" });
    expect(updateMeSchema.parse({})).toEqual({});
  });

  it("rejects unknown fields", () => {
    expect(updateMeSchema.safeParse({ city: "Makati", emailVerified: true }).success).toBe(false);
    expect(updateMeSchema.safeParse({ suspendedAt: null }).success).toBe(false);
  });

  it("accepts a hobby list with levels", () => {
    const hobbies = [
      { hobbyId: HOBBY_A, level: "has" },
      { hobbyId: HOBBY_B, level: "trying" },
    ];
    expect(updateMeSchema.parse({ hobbies })).toEqual({ hobbies });
  });

  it("rejects the same hobby picked twice", () => {
    const hobbies = [
      { hobbyId: HOBBY_A, level: "has" },
      { hobbyId: HOBBY_A, level: "trying" },
    ];
    expect(updateMeSchema.safeParse({ hobbies }).success).toBe(false);
  });

  it(`allows up to ${HOBBIES_PER_USER_MAX} hobbies`, () => {
    const hobbyList = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        hobbyId: `5b3f6c1e-2a4d-4c8b-9e7f-${String(i).padStart(12, "0")}`,
        level: "has",
      }));
    expect(updateMeSchema.safeParse({ hobbies: hobbyList(HOBBIES_PER_USER_MAX) }).success).toBe(true);
    expect(updateMeSchema.safeParse({ hobbies: hobbyList(HOBBIES_PER_USER_MAX + 1) }).success).toBe(false);
  });
});

describe("otherHobbies (typed-in hobby requests)", () => {
  it("trims names and keeps the level", () => {
    const parsed = updateMeSchema.parse({ otherHobbies: [{ name: "  Leathercraft ", level: "trying" }] });
    expect(parsed.otherHobbies).toEqual([{ name: "Leathercraft", level: "trying" }]);
  });

  it("rejects names that are too short or too long, and the same name twice", () => {
    const bad = [
      [{ name: "a", level: "has" }],
      [{ name: "x".repeat(OTHER_HOBBY_NAME_MAX + 1), level: "has" }],
      [
        { name: "Kumihimo", level: "has" },
        { name: "kumihimo", level: "trying" },
      ],
    ];
    for (const otherHobbies of bad) {
      expect(updateMeSchema.safeParse({ otherHobbies }).success, JSON.stringify(otherHobbies)).toBe(false);
    }
  });

  it(`allows up to ${OTHER_HOBBIES_MAX}`, () => {
    const list = (count: number) => Array.from({ length: count }, (_, i) => ({ name: `Hobby ${i}`, level: "has" }));
    expect(updateMeSchema.safeParse({ otherHobbies: list(OTHER_HOBBIES_MAX) }).success).toBe(true);
    expect(updateMeSchema.safeParse({ otherHobbies: list(OTHER_HOBBIES_MAX + 1) }).success).toBe(false);
  });
});

describe("profile responses", () => {
  const profile = {
    id: HOBBY_A,
    handle: "test_kiln",
    displayName: "Test Kiln",
    photoUrl: null,
    bio: null,
    city: "Quezon City",
    hobbies: [{ id: HOBBY_B, name: "Pottery", slug: "pottery", level: "has" }],
    memberSince: "2026-11-05T10:00:00.000Z",
    isNewTrader: true,
    rating: null,
    reviewCount: 0,
    tradeCount: 0,
  };

  it("accepts a public profile", () => {
    expect(publicProfileSchema.parse(profile)).toEqual(profile);
  });

  it("never carries private fields in a public profile", () => {
    const keys = Object.keys(publicProfileSchema.shape);
    for (const key of ["email", "emailVerified", "reportCount", "suspendedAt", "messagePermission"]) {
      expect(keys).not.toContain(key);
    }
  });

  it("adds owner-only fields to /api/me", () => {
    const me = {
      ...profile,
      email: "tester1@example.com",
      emailVerified: false,
      messagePermission: "anyone",
      otherHobbies: [],
    };
    expect(meSchema.parse(me)).toEqual(me);
  });
});
