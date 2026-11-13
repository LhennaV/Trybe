// Drizzle schema: tables, columns, constraints, and indexes.
// Functions, triggers, RLS policies, and cron jobs go in custom SQL migrations
// instead (docs/database.md section 4).
//
// Every table has RLS on and no policies: the browser never reads or writes
// these tables directly, only the server connection does (docs/database.md
// section 10).

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { HOBBY_LEVELS } from "@/shared/contracts/hobbies";
import {
  ITEM_CONDITIONS,
  ITEM_NAME_MAX,
  ITEM_PHOTOS_MAX,
  ITEM_STATUSES,
  LOOKING_FOR_MAX,
} from "@/shared/contracts/items";
import { POST_CAPTION_MAX, POST_PHOTOS_MAX, POST_TITLE_MAX } from "@/shared/contracts/posts";
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

// ===========================================================================
// Phase 2: items, posts, and feed
// ===========================================================================

// SQL number for check constraints, from a contract constant.
const num = (value: number) => sql.raw(String(value));

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

// Kinds of gear within one hobby, for example "Wheels & kilns" under Pottery.
// Seeded (migration 0008). Every hobby has an "Other", shown last.
export const categories = pgTable(
  "categories",
  {
    id: id(),
    hobbyId: uuid("hobby_id")
      .notNull()
      .references(() => hobbies.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    // Display order inside the hobby, lowest first.
    position: smallint("position").notNull(),
    ...timestamps(),
  },
  (t) => [
    // Also serves "categories of one hobby" and the hobby_id key.
    uniqueIndex("uq_categories_hobby_id_slug").on(t.hobbyId, t.slug),
    check("ck_categories_slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// photos
// ---------------------------------------------------------------------------

// Every uploaded photo (TRD section 13). Uploaded first, then attached to an
// item or a post by id. Only storage paths are stored: URLs are built from
// NEXT_PUBLIC_SUPABASE_URL when read, so nothing breaks if the project moves.
export const photos = pgTable(
  "photos",
  {
    id: id(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Paths in the "photos" bucket: full size (about 1600px) and thumbnail.
    path: text("path").notNull(),
    thumbPath: text("thumb_path").notNull(),
    // Size of the full image, so the feed can pick a tall or short card.
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    ...timestamps(),
  },
  (t) => [
    index("idx_photos_owner_id").on(t.ownerId),
    // Orphan cleanup: photos never attached, oldest first.
    index("idx_photos_created_at").on(t.createdAt),
    uniqueIndex("uq_photos_path").on(t.path),
    check("ck_photos_size", sql`${t.width} > 0 and ${t.height} > 0`),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// items
// ---------------------------------------------------------------------------

// A person's gear (TRD section 8.3). Status changes only through trades.
export const items = pgTable(
  "items",
  {
    id: id(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    condition: text("condition", { enum: ITEM_CONDITIONS }).notNull(),
    upForTrade: boolean("up_for_trade").notNull().default(false),
    lookingFor: text("looking_for"),
    status: text("status", { enum: ITEM_STATUSES }).notNull().default("available"),
    ...timestamps(),
  },
  (t) => [
    // "My gear" and the propose screen, and the owner_id key.
    index("idx_items_owner_id_status").on(t.ownerId, t.status),
    // Explore and matches: only gear someone can actually get.
    index("idx_items_tradeable")
      .on(t.categoryId)
      .where(sql`${t.status} = 'available' and ${t.upForTrade}`),
    // The category key, for the restrict check when a category is deleted.
    index("idx_items_category_id").on(t.categoryId),
    check("ck_items_name_length", sql`char_length(${t.name}) between 1 and ${num(ITEM_NAME_MAX)}`),
    check("ck_items_looking_for_length", sql`char_length(${t.lookingFor}) <= ${num(LOOKING_FOR_MAX)}`),
    check("ck_items_condition", sql`${t.condition} in (${inList(ITEM_CONDITIONS)})`),
    check("ck_items_status", sql`${t.status} in (${inList(ITEM_STATUSES)})`),
  ],
).enableRLS();

// Photos of an item, in order (0 is the cover). A photo belongs to one item.
export const itemPhotos = pgTable(
  "item_photos",
  {
    id: id(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("uq_item_photos_photo_id").on(t.photoId),
    // Also serves the item_id key.
    uniqueIndex("uq_item_photos_item_id_position").on(t.itemId, t.position),
    check("ck_item_photos_position", sql`${t.position} between 0 and ${num(ITEM_PHOTOS_MAX - 1)}`),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// posts
// ---------------------------------------------------------------------------

// What someone made (TRD section 8.4). One hobby per post (decided
// 2026-11-08), so the hobby is a column, not a separate table. "For trade" is
// derived from tagged items, never stored (POST-02).
export const posts = pgTable(
  "posts",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hobbyId: uuid("hobby_id")
      .notNull()
      .references(() => hobbies.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    caption: text("caption").notNull().default(""),
    // Set by moderation (Phase 5). Hidden posts leave the feed and profiles.
    hiddenAt: timestamp("hidden_at", { withTimezone: true }),
    ...timestamps(),
  },
  (t) => [
    // The feed, newest first, with cursor pagination on (created_at, id).
    index("idx_posts_feed")
      .on(t.createdAt.desc(), t.id.desc())
      .where(sql`${t.hiddenAt} is null`),
    // The feed filtered by one hobby (POST-05).
    index("idx_posts_hobby_feed")
      .on(t.hobbyId, t.createdAt.desc(), t.id.desc())
      .where(sql`${t.hiddenAt} is null`),
    // A profile's posts tab, and the user_id key for account deletion.
    index("idx_posts_user_id_created_at").on(t.userId, t.createdAt.desc()),
    // The hobby key, for the restrict check (the feed index is partial).
    index("idx_posts_hobby_id").on(t.hobbyId),
    check("ck_posts_title_length", sql`char_length(${t.title}) between 1 and ${num(POST_TITLE_MAX)}`),
    check("ck_posts_caption_length", sql`char_length(${t.caption}) <= ${num(POST_CAPTION_MAX)}`),
  ],
).enableRLS();

// Photos of a post, in order (0 is the cover). A photo belongs to one post.
export const postPhotos = pgTable(
  "post_photos",
  {
    id: id(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
    ...timestamps(),
  },
  (t) => [
    uniqueIndex("uq_post_photos_photo_id").on(t.photoId),
    // Also serves the post_id key.
    uniqueIndex("uq_post_photos_post_id_position").on(t.postId, t.position),
    check("ck_post_photos_position", sql`${t.position} between 0 and ${num(POST_PHOTOS_MAX - 1)}`),
  ],
).enableRLS();

// Gear used in a post (POST-01). Only the author's own items (the API checks).
export const postItems = pgTable(
  "post_items",
  {
    id: id(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    ...timestamps(),
  },
  (t) => [
    // Also serves the post_id key.
    uniqueIndex("uq_post_items_post_id_item_id").on(t.postId, t.itemId),
    // Posts that tag an item, and the item_id key.
    index("idx_post_items_item_id").on(t.itemId),
  ],
).enableRLS();

// ---------------------------------------------------------------------------
// likes and saves
// ---------------------------------------------------------------------------

// One like per person per post (POST-06).
export const likes = pgTable(
  "likes",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    ...timestamps(),
  },
  (t) => [
    // Also serves the user_id key.
    uniqueIndex("uq_likes_user_id_post_id").on(t.userId, t.postId),
    // Like counts per post, and the post_id key.
    index("idx_likes_post_id").on(t.postId),
  ],
).enableRLS();

// One save per person per post (POST-07). A simple save, not boards (Open).
export const saves = pgTable(
  "saves",
  {
    id: id(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    ...timestamps(),
  },
  (t) => [
    // "My saved posts", and the user_id key.
    uniqueIndex("uq_saves_user_id_post_id").on(t.userId, t.postId),
    index("idx_saves_post_id").on(t.postId),
  ],
).enableRLS();
