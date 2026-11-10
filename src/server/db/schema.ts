// Drizzle schema: tables, columns, constraints, and indexes.
// Functions, triggers, RLS policies, and cron jobs go in custom SQL migrations
// instead (docs/database.md section 4).
//
// Every table has RLS on and no policies: the browser never reads or writes
// these tables directly, only the server connection does (docs/database.md
// section 10).

import { sql } from "drizzle-orm";
import { boolean, check, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { HOBBY_LEVELS } from "@/shared/contracts/hobbies";
import {
  BIO_MAX,
  CITY_MAX,
  DISPLAY_NAME_MAX,
  HANDLE_MAX,
  HANDLE_MIN,
  HANDLE_PATTERN,
  MESSAGE_PERMISSIONS,
  OTHER_HOBBY_NAME_MAX,
  OTHER_HOBBY_NAME_MIN,
} from "@/shared/contracts/users";

// `id`, `created_at`, `updated_at` on every table. `updated_at` is kept
// current by the trg_<table>_updated_at trigger, not by app code.
const id = () => uuid("id").primaryKey().defaultRandom();
const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// SQL `in (...)` list from a const array, for check constraints.
const inList = (values: readonly string[]) => sql.raw(values.map((v) => `'${v}'`).join(", "));

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

// One row per Supabase Auth user, same id. Deleting the auth user deletes
// the profile. `is_new_trader` is derived from account age, never stored.
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    displayName: text("display_name").notNull(),
    // Lowercase only, so uniqueness is case-insensitive. The check
    // constraints below reuse the limits from src/shared/contracts/users.ts.
    handle: text("handle").notNull(),
    photoUrl: text("photo_url"),
    bio: text("bio"),
    // City only, never an exact location (PROF-05).
    city: text("city"),
    messagePermission: text("message_permission", { enum: MESSAGE_PERMISSIONS }).notNull().default("anyone"),
    // When the user confirmed the minimum age and accepted the Terms and
    // Community Guidelines at sign up (AUTH-03, AUTH-04).
    ageConfirmedAt: timestamp("age_confirmed_at", { withTimezone: true }).notNull(),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull(),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("uq_users_handle").on(t.handle),
    index("idx_users_city").on(t.city),
    check("ck_users_handle_format", sql`${t.handle} ~ ${sql.raw(`'${HANDLE_PATTERN.source}'`)}`),
    check(
      "ck_users_handle_length",
      sql`char_length(${t.handle}) between ${sql.raw(String(HANDLE_MIN))} and ${sql.raw(String(HANDLE_MAX))}`,
    ),
    check("ck_users_display_name_length", sql`char_length(${t.displayName}) between 1 and ${sql.raw(String(DISPLAY_NAME_MAX))}`),
    check("ck_users_bio_length", sql`char_length(${t.bio}) <= ${sql.raw(String(BIO_MAX))}`),
    check("ck_users_city_length", sql`char_length(${t.city}) between 1 and ${sql.raw(String(CITY_MAX))}`),
    check("ck_users_message_permission", sql`${t.messagePermission} in (${inList(MESSAGE_PERMISSIONS)})`),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// hobbies
// ---------------------------------------------------------------------------

// Seeded list (migration 0003). Users pick from it; they can't add their own.
export const hobbies = pgTable(
  "hobbies",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("uq_hobbies_slug").on(t.slug),
    check("ck_hobbies_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// user_hobbies
// ---------------------------------------------------------------------------

// Hobbies a user has ("has") or wants to try ("trying") (PROF-01).
export const userHobbies = pgTable(
  "user_hobbies",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Restrict: a hobby someone picked can't be deleted from the list by accident.
    hobbyId: uuid("hobby_id")
      .notNull()
      .references(() => hobbies.id, { onDelete: "restrict" }),
    level: text("level", { enum: HOBBY_LEVELS }).notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("uq_user_hobbies_user_id_hobby_id").on(t.userId, t.hobbyId),
    index("idx_user_hobbies_hobby_id").on(t.hobbyId),
    check("ck_user_hobbies_level", sql`${t.level} in (${inList(HOBBY_LEVELS)})`),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// hobby_requests
// ---------------------------------------------------------------------------

// Hobbies people typed in because they aren't on the list ("Other" in
// onboarding). Only the owner sees theirs. When a name gets popular, a
// migration adds it to hobbies and moves these rows to user_hobbies.
export const hobbyRequests = pgTable(
  "hobby_requests",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    level: text("level", { enum: HOBBY_LEVELS }).notNull(),
    ...timestamps(),
  },
  (t) => [
    // One request per name per person, whatever the capitals.
    uniqueIndex("uq_hobby_requests_user_id_name").on(t.userId, sql`lower(${t.name})`),
    // Counting how many people asked for the same hobby.
    index("idx_hobby_requests_name").on(sql`lower(${t.name})`),
    check(
      "ck_hobby_requests_name_length",
      sql`char_length(${t.name}) between ${sql.raw(String(OTHER_HOBBY_NAME_MIN))} and ${sql.raw(String(OTHER_HOBBY_NAME_MAX))}`,
    ),
    check("ck_hobby_requests_level", sql`${t.level} in (${inList(HOBBY_LEVELS)})`),
  ],
).enableRLS();
