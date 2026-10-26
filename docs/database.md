# Trybe Database Design

|              |                                                                          |
| ------------ | ------------------------------------------------------------------------ |
| Version      | 0.1                                                                      |
| Last updated | 2026-10-26                                                               |
| Database     | PostgreSQL on Supabase                                                   |
| Owner        | Tristan                                                                  |
| Related      | `docs/technical-requirements.md` (sections 9, 11, 14), `docs/testing.md` |

This document covers how the database is organized: where logic lives,
naming, database functions, indexes, the audit trail, scheduled jobs, and
data retention.

## 1. Approach

Trybe uses a **hybrid** model.

| Kind of work                                                                         | Where it lives                             | Why                                                                                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Critical operations that must be atomic (trades, item reservation, account deletion) | **Postgres functions** in the `app` schema | Runs in one transaction next to the data, with locking. Same behavior for web and a future native app.    |
| Simple reads and writes (feed, profiles, posts, items)                               | **Drizzle** queries in `src/server/`       | Easier to write, type-safe, easy to test. Drizzle always uses parameterized queries, so no SQL injection. |
| Audit trail, `updated_at`                                                            | **Triggers**                               | Happens automatically, cannot be skipped by app code.                                                     |
| Recurring cleanup and timed rules                                                    | **pg_cron** jobs                           | Runs inside the database on a schedule.                                                                   |

Route handlers never write SQL. They call functions in `src/server/`, which
either use Drizzle or call a database function.

## 2. Schemas

| Schema            | Contains                                           | Exposed to the browser                   |
| ----------------- | -------------------------------------------------- | ---------------------------------------- |
| `public`          | Tables                                             | Only through Row Level Security policies |
| `app`             | Database functions, trigger functions, `audit_log` | **No**                                   |
| `auth`, `storage` | Managed by Supabase                                | Managed by Supabase                      |

### Keep `app` private

Supabase exposes schemas through its API. Anything callable there can be
called by anyone with the public anon key. To prevent that:

- Do not add `app` to the exposed schemas in Supabase API settings.
- Revoke default access. Postgres lets everyone execute new functions by
  default.

```sql
create schema if not exists app;

revoke all on schema app from public, anon, authenticated;
revoke execute on all functions in schema app from public, anon, authenticated;
alter default privileges in schema app
  revoke execute on functions from public, anon, authenticated;
```

Only the server connection (`DATABASE_URL`) calls `app` functions.

## 3. Naming conventions

| Thing              | Rule                                             | Example                              |
| ------------------ | ------------------------------------------------ | ------------------------------------ |
| Tables             | snake_case, plural                               | `trade_offers`                       |
| Columns            | snake_case                                       | `cash_from`                          |
| Primary key        | `id uuid default gen_random_uuid()`              |                                      |
| Foreign key        | `<singular>_id`                                  | `trade_id`                           |
| Timestamps         | `timestamptz`, stored in UTC, names end in `_at` | `created_at`, `hidden_at`            |
| Booleans           | Start with `is_`, `has_`, or describe state      | `up_for_trade`, `is_admin`           |
| Status values      | `text` with a `check` constraint                 | `check (status in ('pending', ...))` |
| Indexes            | `idx_<table>_<columns>`                          | `idx_items_owner_id_status`          |
| Unique constraints | `uq_<table>_<columns>`                           | `uq_ratings_trade_id_rater_id`       |
| Functions          | `app.<area>_<action>`                            | `app.trade_accept`                   |
| Triggers           | `trg_<table>_<purpose>`                          | `trg_trades_audit`                   |
| Cron jobs          | `<area>_<action>`                                | `ratings_reveal`                     |

## 4. Migrations

- Tables, columns, constraints, and indexes are defined in the Drizzle schema
  in `src/server/db/` and generated with Drizzle.
- Functions, triggers, RLS policies, grants, and cron jobs go in **custom SQL
  migrations** created with Drizzle (`drizzle-kit generate --custom`).
- Use `create or replace function` so a function can be updated in a new
  migration.
- Never edit an applied migration. Add a new one.
- Every migration is applied to the dev project first, tested, then applied
  to production.

## 5. Database functions

### 5.1 List

| Function                                                                                    | Does                                                              | Requirement IDs        |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------- |
| `app.trade_propose(actor, recipient, want_item_ids, give_item_ids, cash_amount, cash_from)` | Creates the trade and first offer                                 | TRD-01, TRD-02, TRD-09 |
| `app.trade_counter(trade_id, actor, want_item_ids, give_item_ids, cash_amount, cash_from)`  | Adds a new offer, updates `current_offer_id`                      | TRD-03, TRD-04         |
| `app.trade_accept(trade_id, actor)`                                                         | Accepts, reserves items, cancels conflicting trades               | TRD-04, TRD-06         |
| `app.trade_decline(trade_id, actor)`                                                        | Declines the current offer                                        | TRD-04                 |
| `app.trade_cancel(trade_id, actor, reason)`                                                 | Cancels, frees reserved items, files a report on no-show          | TRD-08, MEET-06        |
| `app.trade_set_meetup(trade_id, actor, spot_id, meetup_at)`                                 | Proposes a meetup                                                 | MEET-01                |
| `app.trade_confirm_meetup(trade_id, actor)`                                                 | Confirms the meetup                                               | MEET-01                |
| `app.trade_confirm_complete(trade_id, actor)`                                               | Records one side; completes when both confirm, marks items traded | MEET-05                |
| `app.rating_submit(trade_id, actor, score, tags, note)`                                     | Saves a rating; reveals both if both are in                       | RATE-01, RATE-02       |
| `app.account_delete(user_id)`                                                               | Cancels active trades, frees items, deletes and anonymizes data   | DEL-01, DEL-03         |

### 5.2 Rules for every function

1. Take the acting user as an explicit parameter (`p_actor_id`). Never trust
   a value passed from the client for who is acting; the server reads it from
   the session.
2. Set a fixed search path: `set search_path = ''`, and write every table as
   `public.table_name`.
3. Lock rows in a fixed order to avoid deadlocks:
   **trade row first, then item rows sorted by `id`.**
4. Re-check status and permissions after locking, not before.
5. Raise errors with a stable code as the message. The API maps the code to
   an HTTP status.
6. Do not use `security definer` unless there is a written reason in the
   migration.

### 5.3 Error codes

```sql
raise exception 'TRADE_NOT_PENDING' using errcode = 'P0001';
```

| Code                                                           | HTTP status           |
| -------------------------------------------------------------- | --------------------- |
| `TRADE_NOT_FOUND`                                              | 404                   |
| `NOT_TRADE_MEMBER`                                             | 403                   |
| `CANNOT_ACCEPT_OWN_OFFER`                                      | 403                   |
| `CANNOT_TRADE_WITH_SELF`                                       | 400                   |
| `EMAIL_NOT_VERIFIED`                                           | 403                   |
| `ITEM_NOT_OWNED`                                               | 403                   |
| `TRADE_NOT_PENDING`                                            | 409                   |
| `TRADE_NOT_ACCEPTED`                                           | 409                   |
| `ITEM_NOT_AVAILABLE`                                           | 409                   |
| `ALREADY_RATED`                                                | 409                   |
| Postgres deadlock (`40P01`) or serialization failure (`40001`) | 409, client may retry |

The full list lives in `src/shared/contracts/common.ts`.

### 5.4 Example: accept (sketch, test before use)

```sql
create or replace function app.trade_accept(p_trade_id uuid, p_actor_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades%rowtype;
  v_offer public.trade_offers%rowtype;
begin
  -- 1. Lock the trade
  select * into v_trade
  from public.trades
  where id = p_trade_id
  for update;

  if not found then
    raise exception 'TRADE_NOT_FOUND' using errcode = 'P0001';
  end if;

  if p_actor_id not in (v_trade.initiator_id, v_trade.recipient_id) then
    raise exception 'NOT_TRADE_MEMBER' using errcode = 'P0001';
  end if;

  if v_trade.status <> 'pending' then
    raise exception 'TRADE_NOT_PENDING' using errcode = 'P0001';
  end if;

  select * into v_offer
  from public.trade_offers
  where id = v_trade.current_offer_id;

  if v_offer.made_by = p_actor_id then
    raise exception 'CANNOT_ACCEPT_OWN_OFFER' using errcode = 'P0001';
  end if;

  -- 2. Lock the items in id order
  perform 1
  from public.items i
  join public.trade_offer_items toi on toi.item_id = i.id
  where toi.offer_id = v_offer.id
  order by i.id
  for update of i;

  if exists (
    select 1
    from public.items i
    join public.trade_offer_items toi on toi.item_id = i.id
    where toi.offer_id = v_offer.id
      and i.status <> 'available'
  ) then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  -- 3. Apply changes
  update public.items
  set status = 'reserved', updated_at = now()
  where id in (
    select item_id from public.trade_offer_items where offer_id = v_offer.id
  );

  update public.trades
  set status = 'accepted', updated_at = now()
  where id = p_trade_id;

  -- 4. Cancel other pending trades that use any of these items
  update public.trades t
  set status = 'cancelled',
      cancel_reason = 'ITEM_RESERVED_ELSEWHERE',
      updated_at = now()
  where t.status = 'pending'
    and t.id <> p_trade_id
    and exists (
      select 1
      from public.trade_offer_items toi
      where toi.offer_id = t.current_offer_id
        and toi.item_id in (
          select item_id from public.trade_offer_items where offer_id = v_offer.id
        )
    );
end;
$$;
```

### 5.5 Calling a function from the server

```ts
// src/server/trades/accept.ts
import { sql } from "drizzle-orm";
import { withActor } from "@/server/db/withActor";

export async function acceptTrade(tradeId: string, actorId: string) {
  return withActor(actorId, (tx) =>
    tx.execute(sql`select app.trade_accept(${tradeId}, ${actorId})`),
  );
}
```

`withActor` opens a transaction and sets the actor for the audit trail
(section 7.3) before running the callback.

## 6. Indexing

### 6.1 Rules

1. Add an index for a real query, not for every column. Each index slows
   down inserts and updates and uses storage.
2. Index the columns used in `where`, `join`, and `order by` of frequent
   queries.
3. Postgres does **not** index foreign keys automatically. Index foreign keys
   that are used in joins or deletes.
4. Use **composite indexes** in the order the query filters: equality columns
   first, then range or sort columns.
5. Use **partial indexes** when queries always filter on the same condition,
   for example only available items or only unread notifications.
6. Unique constraints already create an index. Do not add a second one.
7. Before adding or removing an index, check the query with
   `explain analyze`. Review slow queries in the Supabase dashboard
   (query performance and index advisor) once a month.
8. Every index is listed in section 6.2 with the query it serves.

### 6.2 Starting indexes

| Table             | Index                                                                           | Serves                         |
| ----------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| users             | `uq_users_handle (handle)`                                                      | Profile by handle              |
| users             | `idx_users_city (city)`                                                         | "Near you"                     |
| user_hobbies      | `uq_user_hobbies_user_id_hobby_id`                                              | One row per hobby per user     |
| user_hobbies      | `idx_user_hobbies_hobby_id (hobby_id)`                                          | Users by hobby, matches        |
| items             | `idx_items_owner_id_status (owner_id, status)`                                  | "My gear", propose screen      |
| items             | `idx_items_tradeable (category_id) where status = 'available' and up_for_trade` | Explore, matches               |
| posts             | `idx_posts_feed (created_at desc, id desc) where hidden_at is null`             | Feed with cursor pagination    |
| posts             | `idx_posts_user_id_created_at (user_id, created_at desc)`                       | Profile posts tab              |
| post_hobbies      | `idx_post_hobbies_hobby_id_post_id (hobby_id, post_id)`                         | Feed filtered by hobby         |
| post_items        | `idx_post_items_item_id (item_id)`                                              | Posts that tag an item         |
| likes             | `uq_likes_user_id_post_id`                                                      | One like per user per post     |
| saves             | `uq_saves_user_id_post_id`                                                      | One save per user per post     |
| trades            | `idx_trades_initiator_id_status (initiator_id, status)`                         | Trades list                    |
| trades            | `idx_trades_recipient_id_status (recipient_id, status)`                         | Trades list                    |
| trades            | `idx_trades_meetup_at_accepted (meetup_at) where status = 'accepted'`           | Expired meetup job             |
| trade_offers      | `idx_trade_offers_trade_id_created_at (trade_id, created_at)`                   | Offer history                  |
| trade_offer_items | `idx_trade_offer_items_offer_id (offer_id)`                                     | Items in an offer              |
| trade_offer_items | `idx_trade_offer_items_item_id (item_id)`                                       | Conflicting trades on accept   |
| messages          | `idx_messages_trade_id_created_at (trade_id, created_at)`                       | Chat history                   |
| ratings           | `uq_ratings_trade_id_rater_id`                                                  | One rating per rater per trade |
| ratings           | `idx_ratings_ratee_id_visible (ratee_id) where visible_at is not null`          | Reviews on a profile           |
| ratings           | `idx_ratings_hidden_created_at (created_at) where visible_at is null`           | Rating reveal job              |
| reports           | `idx_reports_open (created_at) where status = 'open'`                           | Admin queue                    |
| blocks            | `uq_blocks_blocker_id_blocked_id`                                               | Block lookups                  |
| blocks            | `idx_blocks_blocked_id (blocked_id)`                                            | "Who blocked me" filtering     |
| notifications     | `idx_notifications_user_id_created_at (user_id, created_at desc)`               | Notification list              |
| notifications     | `idx_notifications_unread (user_id) where read_at is null`                      | Unread badge                   |
| audit_log         | `idx_audit_log_table_record (table_name, record_id)`                            | History of one record          |
| audit_log         | `idx_audit_log_actor_id (actor_id)`                                             | Actions by a user              |
| audit_log         | `idx_audit_log_changed_at (changed_at)`                                         | Purge job                      |

Text search for posts, items, and people is added in Phase 6 after the
search design is decided.

## 7. Audit trail

### 7.1 What is audited

| Audited                                                                                | Not audited                                                                  |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| users, items, posts, trades, trade_offers, trade_offer_items, ratings, reports, blocks | likes, saves, notifications, messages (too frequent; chat is its own record) |

### 7.2 Table and trigger

```sql
create table app.audit_log (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  record_id   uuid,
  action      text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id    uuid,
  old_data    jsonb,
  new_data    jsonb,
  changed_at  timestamptz not null default now()
);

create or replace function app.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
-- security definer: lets triggers write to app.audit_log even though
-- normal roles have no access to the app schema.
begin
  insert into app.audit_log (table_name, record_id, action, actor_id, old_data, new_data)
  values (
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end,
    tg_op,
    nullif(current_setting('app.actor_id', true), '')::uuid,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger trg_trades_audit
after insert or update or delete on public.trades
for each row execute function app.audit_row();
```

Repeat the trigger for each audited table.

### 7.3 Recording who made the change

The API talks to the database through the server connection, so
`auth.uid()` is empty inside triggers. Instead, every write transaction sets
the actor first:

```sql
select set_config('app.actor_id', '<user uuid>', true);
```

The `true` makes it last only for the current transaction. `withActor` in
`src/server/db/` does this automatically. Writes without an actor (cron jobs,
admin scripts) leave `actor_id` empty, which means "system".

### 7.4 Audit log rules

- Rows are never edited. Only the purge job deletes them.
- No API endpoint returns raw audit rows to normal users. Admins see them on
  the admin page.
- Sensitive fields are not copied into the log. Exclude password-like or
  token fields from `to_jsonb` if any are ever added to audited tables.
- On account deletion, `app.account_delete` removes the user's personal data
  from `old_data` and `new_data` in their audit rows and clears `actor_id`.
  The row itself stays, so the history of trades remains consistent.

## 8. Scheduled jobs (pg_cron)

Times are in UTC. 19:00 UTC is 3:00 AM in the Philippines, when traffic is
lowest.

| Job                      | Schedule              | Does                                                                                              |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------------------------- |
| `ratings_reveal`         | `0 * * * *` (hourly)  | Sets `visible_at` on ratings where both sides rated or 7 days passed (RATE-02)                    |
| `trades_expire_meetups`  | `0 19 * * *` (daily)  | Cancels accepted trades 72 hours after `meetup_at` with no completion, frees items, notifies both |
| `users_purge_unverified` | `15 19 * * *` (daily) | Deletes accounts never verified after 7 days                                                      |
| `notifications_purge`    | `30 19 * * *` (daily) | Deletes read notifications older than 90 days                                                     |
| `audit_log_purge`        | `0 20 * * 0` (weekly) | Deletes audit rows older than 1 year                                                              |

### Job rules

1. Jobs call an `app` function, never long inline SQL:
   `select cron.schedule('ratings_reveal', '0 * * * *', 'select app.ratings_reveal()');`
2. Jobs must be safe to run twice (idempotent).
3. Delete in batches (for example 1,000 rows at a time) so the job never
   locks a table for long.
4. Check `cron.job_run_details` weekly for failures.
5. The 72-hour meetup window and the 7-day rating window are
   **Proposed** values.

### Not a database job

**Orphan photo cleanup** runs as a server job (Vercel Cron calling an API
route) using the Supabase Storage API. Deleting rows from `storage.objects`
with SQL does not delete the actual files.

## 9. Data retention and purging

| Data                       | Kept for                                                    | How it ends                 |
| -------------------------- | ----------------------------------------------------------- | --------------------------- |
| Unverified accounts        | 7 days                                                      | `users_purge_unverified`    |
| Active accounts            | Until the user deletes                                      | `app.account_delete`        |
| Posts hidden by moderation | 90 days, then deleted (**Proposed**)                        | Purge job, added in Phase 5 |
| Read notifications         | 90 days                                                     | `notifications_purge`       |
| Messages                   | Until either user deletes their account (**Proposed**)      | `app.account_delete`        |
| Ratings                    | Kept, author shown as "Deleted user" after account deletion | `app.account_delete`        |
| Reports                    | 1 year after resolution (**Proposed**)                      | Purge job, added in Phase 5 |
| Audit log                  | 1 year                                                      | `audit_log_purge`           |
| Backups                    | Supabase Pro retention                                      | Supabase                    |

These periods must match the privacy policy. Change both together.

## 10. Row Level Security

- RLS is enabled on every table in `public`, with no exceptions.
- Tables the browser never reads directly have RLS on and **no policies**,
  so only the server connection can use them.
- `messages` has a select policy for trade members who have not blocked each
  other (TRD section 12).
- No table has insert, update, or delete policies for `anon` or
  `authenticated`. All writes go through the API.

## 11. Checklist for a new table

- [ ] Defined in the Drizzle schema with `id`, `created_at`, `updated_at`
- [ ] Foreign keys with the right `on delete` behavior
- [ ] Status columns use a `check` constraint
- [ ] RLS enabled
- [ ] `updated_at` trigger added
- [ ] Audit trigger added, if the table is in section 7.1
- [ ] Indexes added for its real queries and listed in section 6.2
- [ ] Retention decided and listed in section 9
- [ ] Handled in `app.account_delete` if it holds user data
- [ ] Tests updated
