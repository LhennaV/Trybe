// Users and profiles contract (TRD sections 8.1, 8.2, and 10). Draft: changes
// need agreement from both owners. The database check constraints in
// src/server/db/schema.ts are built from these limits, so changing one here
// needs a new migration (`pnpm db:generate`).

import { z } from "zod";
import { hobbyLevelSchema, hobbySchema } from "@/shared/contracts/hobbies";

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

// Lowercased before checking, so "Storm_1" and "storm_1" are the same handle.
// Letters, numbers, underscores, and dots ("kiln.and.co"). A dot can't start
// or end the handle or sit next to another dot.
export const HANDLE_MIN = 3;
export const HANDLE_MAX = 20;
export const HANDLE_PATTERN = /^[a-z0-9_]+(\.[a-z0-9_]+)*$/;
export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(HANDLE_MIN, `Use at least ${HANDLE_MIN} characters.`)
  .max(HANDLE_MAX, `Use ${HANDLE_MAX} characters or fewer.`)
  .regex(HANDLE_PATTERN, "Use letters, numbers, underscores, or dots between them.");

export const DISPLAY_NAME_MAX = 50;
export const displayNameSchema = z.string().trim().min(1, "Add a name.").max(DISPLAY_NAME_MAX);

// An empty bio clears it.
export const BIO_MAX = 160;
export const bioSchema = z.string().trim().max(BIO_MAX);

// City only, never an exact location (PROF-05).
export const CITY_MAX = 60;
export const citySchema = z.string().trim().min(1, "Add your city.").max(CITY_MAX);

// Who can start a message with this user. "anyone" sends strangers to
// Requests first. Default for new users is "anyone" (decided 2026-11-05).
export const MESSAGE_PERMISSIONS = ["anyone", "traded_only"] as const;
export const messagePermissionSchema = z.enum(MESSAGE_PERMISSIONS);
export type MessagePermission = z.infer<typeof messagePermissionSchema>;

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export const userHobbySchema = hobbySchema.extend({ level: hobbyLevelSchema });
export type UserHobby = z.infer<typeof userHobbySchema>;

// GET /api/users/:handle. Public, so never add email, report counts
// (PROF-07), suspension, or anything more exact than the city.
export const publicProfileSchema = z.object({
  id: z.uuid(),
  handle: z.string(),
  displayName: z.string(),
  photoUrl: z.url().nullable(),
  bio: z.string().nullable(),
  city: z.string().nullable(),
  hobbies: z.array(userHobbySchema),
  // When the account was created. The app shows it as "time on Trybe".
  memberSince: z.iso.datetime({ offset: true }),
  // Derived from account age and completed trades (PROF-04).
  isNewTrader: z.boolean(),
  // Average of visible ratings, null until the first one is visible.
  rating: z.number().min(1).max(5).nullable(),
  reviewCount: z.number().int().min(0),
  tradeCount: z.number().int().min(0),
});
export type PublicProfile = z.infer<typeof publicProfileSchema>;

// The short version of a person, shown on post cards, items, and trades.
export const userSummarySchema = publicProfileSchema.pick({
  id: true,
  handle: true,
  displayName: true,
  photoUrl: true,
  city: true,
  isNewTrader: true,
  rating: true,
  tradeCount: true,
});
export type UserSummary = z.infer<typeof userSummarySchema>;

// GET /api/me. The public profile plus fields only the owner sees.
export const meSchema = publicProfileSchema.extend({
  email: z.email(),
  emailVerified: z.boolean(),
  messagePermission: messagePermissionSchema,
});
export type Me = z.infer<typeof meSchema>;

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export const HOBBIES_PER_USER_MAX = 30;

// PATCH /api/me. Every field is optional; unknown fields are rejected.
// `hobbies` replaces the whole list when sent.
export const updateMeSchema = z
  .strictObject({
    displayName: displayNameSchema,
    handle: handleSchema,
    bio: bioSchema,
    city: citySchema,
    messagePermission: messagePermissionSchema,
    hobbies: z
      .array(z.strictObject({ hobbyId: z.uuid(), level: hobbyLevelSchema }))
      .max(HOBBIES_PER_USER_MAX)
      .refine((list) => new Set(list.map((h) => h.hobbyId)).size === list.length, "Each hobby can only be picked once."),
  })
  .partial();
export type UpdateMe = z.infer<typeof updateMeSchema>;
