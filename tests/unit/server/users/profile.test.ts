import { describe, expect, it } from "vitest";
import { publicProfileSchema } from "@/shared/contracts/users";
import { AppError } from "@/server/errors";
import { toPublicProfile } from "@/server/users/profile";
import { toUpdateError, toUserColumns } from "@/server/users/update";

const ROW = {
  id: "5b3f6c1e-2a4d-4c8b-9e7f-1a2b3c4d5e6f",
  email: "tester1@example.com",
  emailVerified: true,
  displayName: "Test Kiln",
  handle: "test_kiln",
  photoUrl: null,
  bio: "Wheel-thrown mugs.",
  city: "Quezon City",
  messagePermission: "anyone" as const,
  ageConfirmedAt: new Date("2026-11-01T00:00:00Z"),
  termsAcceptedAt: new Date("2026-11-01T00:00:00Z"),
  suspendedAt: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  updatedAt: new Date("2026-11-01T00:00:00Z"),
};
const STATS = { rating: null, reviewCount: 0, completedTrades: 0 };

describe("toPublicProfile", () => {
  const profile = toPublicProfile(ROW, [], STATS, new Date("2026-11-07T00:00:00Z"));

  it("matches the public profile contract", () => {
    expect(publicProfileSchema.parse(profile)).toEqual(profile);
  });

  it("never copies private fields", () => {
    for (const key of [
      "email",
      "emailVerified",
      "suspendedAt",
      "ageConfirmedAt",
      "termsAcceptedAt",
      "messagePermission",
    ]) {
      expect(profile).not.toHaveProperty(key);
    }
  });

  it("derives the new trader badge and member date", () => {
    expect(profile.isNewTrader).toBe(true);
    expect(profile.memberSince).toBe("2026-11-01T00:00:00.000Z");
  });
});

describe("toUserColumns", () => {
  it("only includes fields that were sent", () => {
    expect(toUserColumns({ city: "Makati" })).toEqual({ city: "Makati" });
    expect(toUserColumns({})).toEqual({});
  });

  it("clears the bio when it is empty", () => {
    expect(toUserColumns({ bio: "" })).toEqual({ bio: null });
  });

  it("never turns hobbies into a users column", () => {
    expect(toUserColumns({ hobbies: [] })).toEqual({});
  });
});

describe("toUpdateError", () => {
  // Shaped like a postgres-js error wrapped by Drizzle.
  const wrapped = (code: string, constraint: string) =>
    new Error("query failed", { cause: Object.assign(new Error("pg"), { code, constraint_name: constraint }) });

  it("turns a duplicate handle into HANDLE_TAKEN", () => {
    const error = toUpdateError(wrapped("23505", "uq_users_handle"));
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("HANDLE_TAKEN");
    expect((error as AppError).fields).toHaveProperty("handle");
  });

  it("turns an unknown hobby into VALIDATION_FAILED on hobbies", () => {
    const error = toUpdateError(wrapped("23503", "user_hobbies_hobby_id_hobbies_id_fk"));
    expect((error as AppError).code).toBe("VALIDATION_FAILED");
    expect((error as AppError).fields).toHaveProperty("hobbies");
  });

  it("passes other errors through unchanged", () => {
    const other = wrapped("23505", "some_other_constraint");
    expect(toUpdateError(other)).toBe(other);
  });
});
