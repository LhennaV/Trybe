-- Trade functions (docs/database.md section 5, TRD section 11).
--
-- Rules for all of them (docs/database.md section 5.2):
-- * The server passes the acting user (p_actor_id) from the session.
-- * search_path is empty; every table is written as public.<name>.
-- * Lock order: the trade row first, then item rows sorted by id.
-- * Status and permissions are checked after locking, never before.
-- * Errors are raised with a stable code as the message (errcode P0001). The
--   server maps the code to an HTTP status (src/server/trades/dbErrors.ts).
-- * Not security definer: only the server connection calls these, and the
--   app schema is closed to anon and authenticated (migration 0000).
--
-- The order of checks matches the state machine (src/server/trades/
-- stateMachine.ts): membership, then status, then who made the offer. The
-- integration tests run the same rules matrix against these functions.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- EMAIL_NOT_VERIFIED unless the user has verified their email (TRD-09).
create or replace function app.trade_require_verified(p_user_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.users where id = p_user_id and email_verified) then
    raise exception 'EMAIL_NOT_VERIFIED' using errcode = 'P0001';
  end if;
end;
$$;
--> statement-breakpoint

-- Locks the trade and checks the actor is one of its two people.
-- `is distinct from` because a deleted account leaves a null id, and
-- `x not in (a, null)` would let anyone through.
create or replace function app.trade_lock(p_trade_id uuid, p_actor_id uuid)
returns public.trades
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
begin
  select * into v_trade from public.trades where id = p_trade_id for update;
  if not found then
    raise exception 'TRADE_NOT_FOUND' using errcode = 'P0001';
  end if;
  if p_actor_id is null
     or (p_actor_id is distinct from v_trade.initiator_id and p_actor_id is distinct from v_trade.recipient_id) then
    raise exception 'NOT_TRADE_MEMBER' using errcode = 'P0001';
  end if;
  return v_trade;
end;
$$;
--> statement-breakpoint

-- Counter, accept, and decline answer the current offer: the trade has to be
-- pending, and only the person who did NOT make the offer answers (TRD-04).
create or replace function app.trade_require_responder(p_trade public.trades, p_actor_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_trade.status <> 'pending' then
    raise exception 'TRADE_NOT_PENDING' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.trade_offers where id = p_trade.current_offer_id and made_by = p_actor_id
  ) then
    raise exception 'CANNOT_ACCEPT_OWN_OFFER' using errcode = 'P0001';
  end if;
end;
$$;
--> statement-breakpoint

-- Checks the items of an offer and writes it as the trade's current offer.
-- The caller has already locked the trade (or just created it).
--   p_actor_side  'initiator' or 'recipient': the actor's side in the trade
--   p_cash_from   'me' or 'them', from the actor's point of view, as the API
--                 sends it. Stored as 'initiator' or 'recipient'.
-- Returns the new offer's id.
create or replace function app.trade_write_offer(
  p_trade_id uuid,
  p_actor_id uuid,
  p_other_id uuid,
  p_actor_side text,
  p_give_item_ids uuid[],
  p_want_item_ids uuid[],
  p_cash_amount integer,
  p_cash_from text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_all uuid[] := coalesce(p_give_item_ids, '{}') || coalesce(p_want_item_ids, '{}');
  v_other_side text := case p_actor_side when 'initiator' then 'recipient' else 'initiator' end;
  v_offer_id uuid;
begin
  -- Zod checks these first; repeated here so no client can skip them.
  if coalesce(cardinality(p_give_item_ids), 0) = 0 or coalesce(cardinality(p_want_item_ids), 0) = 0 then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001',
      detail = 'Pick at least one item on each side.';
  end if;
  if (select count(distinct x) from unnest(v_all) as x) <> cardinality(v_all) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001',
      detail = 'Each item can only be picked once.';
  end if;
  if (p_cash_amount is null) <> (p_cash_from is null) or p_cash_from not in ('me', 'them') then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001',
      detail = 'Cash needs an amount and who pays it.';
  end if;

  -- Lock the items in id order. A share lock is enough: it stops the items
  -- being reserved or deleted until this offer is saved, while two people
  -- can still offer for the same item at the same time.
  perform 1 from public.items where id = any(v_all) order by id for share;

  if (select count(*) from public.items where id = any(v_all)) <> cardinality(v_all) then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.items where id = any(p_give_item_ids) and owner_id <> p_actor_id) then
    raise exception 'ITEM_NOT_OWNED' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.items where id = any(p_want_item_ids) and owner_id = p_actor_id) then
    raise exception 'CANNOT_TRADE_WITH_SELF' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.items where id = any(p_want_item_ids) and owner_id is distinct from p_other_id) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001',
      detail = 'Everything you ask for has to come from the same person.';
  end if;
  -- Your own gear only has to be free; what you ask for has to be up for trade too.
  if exists (
    select 1 from public.items
    where id = any(v_all)
      and (status <> 'available' or (id = any(p_want_item_ids) and not up_for_trade))
  ) then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  insert into public.trade_offers (trade_id, made_by, cash_amount, cash_from)
  values (
    p_trade_id,
    p_actor_id,
    p_cash_amount,
    case p_cash_from when 'me' then p_actor_side when 'them' then v_other_side end
  )
  returning id into v_offer_id;

  -- item_name is a copy, so the offer still reads right if the item is
  -- deleted later (decided 2026-11-17).
  insert into public.trade_offer_items (offer_id, item_id, item_name, side)
  select v_offer_id, i.id, i.name, case when i.owner_id = p_actor_id then p_actor_side else v_other_side end
  from public.items i
  where i.id = any(v_all)
  order by i.id;

  update public.trades set current_offer_id = v_offer_id where id = p_trade_id;
  return v_offer_id;
end;
$$;
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Actions
-- ---------------------------------------------------------------------------

-- POST /api/trades (TRD-01, TRD-02, TRD-09). The recipient is the owner of
-- the wanted items. Returns the new trade's id.
create or replace function app.trade_propose(
  p_actor_id uuid,
  p_give_item_ids uuid[],
  p_want_item_ids uuid[],
  p_cash_amount integer default null,
  p_cash_from text default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_owners uuid[];
  v_trade_id uuid;
begin
  perform app.trade_require_verified(p_actor_id);

  select array_agg(distinct owner_id) into v_owners from public.items where id = any(p_want_item_ids);
  if v_owners is null then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;
  if p_actor_id = any(v_owners) then
    raise exception 'CANNOT_TRADE_WITH_SELF' using errcode = 'P0001';
  end if;
  if cardinality(v_owners) > 1 then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001',
      detail = 'Everything you ask for has to come from the same person.';
  end if;

  insert into public.trades (initiator_id, recipient_id)
  values (p_actor_id, v_owners[1])
  returning id into v_trade_id;

  perform app.trade_write_offer(
    v_trade_id, p_actor_id, v_owners[1], 'initiator',
    p_give_item_ids, p_want_item_ids, p_cash_amount, p_cash_from
  );
  return v_trade_id;
end;
$$;
--> statement-breakpoint

-- POST /api/trades/:id/counter (TRD-03). A new offer row; the trade stays
-- pending and points at it. Returns the new offer's id.
create or replace function app.trade_counter(
  p_trade_id uuid,
  p_actor_id uuid,
  p_give_item_ids uuid[],
  p_want_item_ids uuid[],
  p_cash_amount integer default null,
  p_cash_from text default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
  v_is_initiator boolean;
  v_other_id uuid;
begin
  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  perform app.trade_require_responder(v_trade, p_actor_id);
  perform app.trade_require_verified(p_actor_id);

  v_is_initiator := p_actor_id = v_trade.initiator_id;
  v_other_id := case when v_is_initiator then v_trade.recipient_id else v_trade.initiator_id end;
  if v_other_id is null then
    -- The other person deleted their account.
    raise exception 'TRADE_NOT_PENDING' using errcode = 'P0001';
  end if;

  return app.trade_write_offer(
    p_trade_id, p_actor_id, v_other_id,
    case when v_is_initiator then 'initiator' else 'recipient' end,
    p_give_item_ids, p_want_item_ids, p_cash_amount, p_cash_from
  );
end;
$$;
--> statement-breakpoint

-- POST /api/trades/:id/accept (TRD-04, TRD-06). Reserves the items of the
-- current offer and cancels every other pending trade whose current offer
-- uses any of them.
create or replace function app.trade_accept(p_trade_id uuid, p_actor_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
  v_item_ids uuid[];
begin
  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  perform app.trade_require_responder(v_trade, p_actor_id);

  select array_agg(item_id) into v_item_ids
  from public.trade_offer_items where offer_id = v_trade.current_offer_id;

  perform 1 from public.items where id = any(v_item_ids) order by id for update;

  -- A deleted item leaves a null item_id, so count against the offer rows.
  if exists (
    select 1
    from public.trade_offer_items toi
    left join public.items i on i.id = toi.item_id
    where toi.offer_id = v_trade.current_offer_id
      and (i.id is null or i.status <> 'available')
  ) then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  update public.items set status = 'reserved' where id = any(v_item_ids);
  update public.trades set status = 'accepted' where id = p_trade_id;

  -- Other pending trades lose their items. cancelled_by stays null: the
  -- system cancelled them, not a person.
  update public.trades t
  set status = 'cancelled', cancel_reason = 'item_unavailable'
  where t.status = 'pending'
    and t.id <> p_trade_id
    and t.current_offer_id in (
      select toi.offer_id from public.trade_offer_items toi where toi.item_id = any(v_item_ids)
    );
end;
$$;
--> statement-breakpoint

-- POST /api/trades/:id/decline (TRD-04)
create or replace function app.trade_decline(p_trade_id uuid, p_actor_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
begin
  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  perform app.trade_require_responder(v_trade, p_actor_id);
  update public.trades set status = 'declined' where id = p_trade_id;
end;
$$;
--> statement-breakpoint

-- POST /api/trades/:id/cancel (TRD-08, MEET-06). Either person, before
-- completion. Reserved items go back to available. "no_show" only makes
-- sense after accepting; it will also file a report once the reports table
-- exists (Phase 5).
create or replace function app.trade_cancel(p_trade_id uuid, p_actor_id uuid, p_reason text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
  v_item_ids uuid[];
begin
  if p_reason is null or p_reason not in ('withdrawn', 'no_show') then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001', detail = 'Pick a reason.';
  end if;

  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  if v_trade.status not in ('pending', 'accepted') then
    raise exception 'TRADE_NOT_PENDING' using errcode = 'P0001';
  end if;
  if p_reason = 'no_show' and v_trade.status <> 'accepted' then
    raise exception 'TRADE_NOT_ACCEPTED' using errcode = 'P0001';
  end if;

  if v_trade.status = 'accepted' then
    select array_agg(item_id) into v_item_ids
    from public.trade_offer_items where offer_id = v_trade.current_offer_id;
    perform 1 from public.items where id = any(v_item_ids) order by id for update;
    update public.items set status = 'available' where id = any(v_item_ids) and status = 'reserved';
  end if;

  update public.trades
  set status = 'cancelled', cancelled_by = p_actor_id, cancel_reason = p_reason
  where id = p_trade_id;
end;
$$;
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Deleting an item (decided 2026-11-17)
-- ---------------------------------------------------------------------------

-- Before an item is deleted, cancel the active trades whose current offer
-- uses it (reason item_unavailable) and free the other items those trades
-- had reserved. A trigger, so it also runs when a deleted account takes its
-- items with it. The owner can't delete a reserved item themselves
-- (src/server/items/write.ts), so the accepted case only comes from account
-- deletion.
--
-- The item row is already locked here, so this locks trades after items:
-- the opposite of the usual order. Postgres detects the rare deadlock with a
-- trade being accepted at the same moment and fails one of them (40P01),
-- which the API returns as a 409 the client can retry.
create or replace function app.trades_cancel_for_deleted_item()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_trade_ids uuid[];
begin
  select array_agg(id) into v_trade_ids
  from (
    select t.id
    from public.trades t
    join public.trade_offer_items toi on toi.offer_id = t.current_offer_id
    where toi.item_id = old.id
      and t.status in ('pending', 'accepted')
    order by t.id
    for update of t
  ) locked;

  if v_trade_ids is null then
    return old;
  end if;

  -- Only the other person's items. The owner's own items are being deleted
  -- in this same statement when an account goes, and Postgres refuses to
  -- delete a row a trigger already changed in that statement.
  update public.items
  set status = 'available'
  where status = 'reserved'
    and owner_id <> old.owner_id
    and id in (
      select toi.item_id
      from public.trades t
      join public.trade_offer_items toi on toi.offer_id = t.current_offer_id
      where t.id = any(v_trade_ids) and t.status = 'accepted'
    );

  update public.trades
  set status = 'cancelled', cancel_reason = 'item_unavailable'
  where id = any(v_trade_ids);

  return old;
end;
$$;
--> statement-breakpoint
create trigger trg_items_cancel_trades
before delete on public.items
for each row execute function app.trades_cancel_for_deleted_item();
