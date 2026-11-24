-- In-app notifications (NOTIF-01) and two scheduled jobs: expired meetups and
-- the notifications purge (docs/database.md section 8).
--
-- Notifications are written by triggers on the tables that change, like the
-- chat lines (migration 0019), so every path notifies the same way, in the
-- same transaction. Who to tell is worked out from the row itself, never
-- from the session: the person who acted is never notified.

create trigger trg_notifications_updated_at
before update on public.notifications
for each row execute function app.set_updated_at();
--> statement-breakpoint

-- The other person in a trade.
create or replace function app.trade_other(p_trade public.trades, p_user_id uuid)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case when p_user_id = p_trade.initiator_id then p_trade.recipient_id else p_trade.initiator_id end;
$$;
--> statement-breakpoint

-- Adds one notification, skipping a deleted account and the actor themselves.
-- The exists check matters during account deletion: the account's items go
-- first, which cancels its trades, and the person being deleted must not get
-- a notification (their users row is already gone, so the insert would fail
-- and stop the whole deletion).
create or replace function app.notify(
  p_user_id uuid,
  p_type text,
  p_actor_id uuid,
  p_trade_id uuid,
  p_conversation_id uuid
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_user_id is null
     or p_user_id = p_actor_id
     or not exists (select 1 from public.users where id = p_user_id) then
    return;
  end if;
  insert into public.notifications (user_id, type, actor_id, trade_id, conversation_id)
  values (p_user_id, p_type, p_actor_id, p_trade_id, p_conversation_id);
end;
$$;
--> statement-breakpoint

-- Offers: the first one is a proposal, every later one a counter.
create or replace function app.notifications_offer()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
  v_first boolean;
begin
  select * into v_trade from public.trades where id = new.trade_id;
  select count(*) = 1 into v_first from public.trade_offers where trade_id = new.trade_id;
  perform app.notify(
    app.trade_other(v_trade, new.made_by),
    case when v_first then 'trade_proposed' else 'trade_countered' end,
    new.made_by, new.trade_id, null
  );
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_trade_offers_notify
after insert on public.trade_offers
for each row execute function app.notifications_offer();
--> statement-breakpoint

-- Trade status changes.
create or replace function app.notifications_trade_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_maker uuid;
begin
  if new.status in ('accepted', 'declined') then
    -- The person who answered tells the person who made the offer.
    select made_by into v_maker from public.trade_offers where id = new.current_offer_id;
    perform app.notify(v_maker, 'trade_' || new.status, app.trade_other(new, v_maker), new.id, null);
  elsif new.status = 'cancelled' and new.cancelled_by is not null then
    perform app.notify(app.trade_other(new, new.cancelled_by), 'trade_cancelled', new.cancelled_by, new.id, null);
  elsif new.status in ('cancelled', 'completed') then
    -- Cancelled by the system, or completed: both people hear about it.
    perform app.notify(new.initiator_id, 'trade_' || new.status, null, new.id, null);
    perform app.notify(new.recipient_id, 'trade_' || new.status, null, new.id, null);
  end if;
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_trades_notify_status
after update of status on public.trades
for each row
when (old.status is distinct from new.status)
execute function app.notifications_trade_status();
--> statement-breakpoint

-- Meetups: a suggestion tells the other person; a confirmation tells the
-- person who suggested it.
create or replace function app.notifications_meetup()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.meetup_spot_id is distinct from old.meetup_spot_id or new.meetup_at is distinct from old.meetup_at then
    perform app.notify(app.trade_other(new, new.meetup_proposed_by), 'meetup_suggested', new.meetup_proposed_by, new.id, null);
  elsif old.meetup_confirmed_at is null and new.meetup_confirmed_at is not null then
    perform app.notify(new.meetup_proposed_by, 'meetup_confirmed', app.trade_other(new, new.meetup_proposed_by), new.id, null);
  end if;
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_trades_notify_meetup
after update of meetup_spot_id, meetup_at, meetup_confirmed_at on public.trades
for each row execute function app.notifications_meetup();
--> statement-breakpoint

-- Chat messages from a person. Unread ones from the same thread fold into
-- one notification, moved to the top, instead of one per message.
create or replace function app.notifications_message()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_to uuid;
  v_type text := 'message';
  v_trade public.trades;
  v_conversation public.conversations;
begin
  if new.type <> 'text' or new.sender_id is null then
    return new;
  end if;

  if new.trade_id is not null then
    select * into v_trade from public.trades where id = new.trade_id;
    v_to := app.trade_other(v_trade, new.sender_id);
  else
    select * into v_conversation from public.conversations where id = new.conversation_id;
    v_to := case when new.sender_id = v_conversation.user_a_id then v_conversation.user_b_id else v_conversation.user_a_id end;
    if v_conversation.status = 'requested' then
      v_type := 'message_request';
    end if;
  end if;

  update public.notifications
  set type = v_type, actor_id = new.sender_id, created_at = now()
  where user_id = v_to
    and read_at is null
    and type in ('message', 'message_request')
    and trade_id is not distinct from new.trade_id
    and conversation_id is not distinct from new.conversation_id;

  if not found then
    perform app.notify(v_to, v_type, new.sender_id, new.trade_id, new.conversation_id);
  end if;
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_messages_notify
after insert on public.messages
for each row execute function app.notifications_message();
--> statement-breakpoint

-- A new rating tells the person rated. The rating itself stays hidden until
-- RATE-02 allows it.
create or replace function app.notifications_rating()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform app.notify(new.ratee_id, 'rating_received', new.rater_id, new.trade_id, null);
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_ratings_notify
after insert on public.ratings
for each row execute function app.notifications_rating();
--> statement-breakpoint

-- Daily job: cancels accepted trades whose meetup passed 72 hours ago
-- (Proposed window) without being completed, and frees their reserved items.
-- Trades first, then items in id order, like every trade action. At most 500
-- a run; rows another transaction holds wait for the next run.
-- Returns how many trades it cancelled.
create or replace function app.trades_expire_meetups()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_trade_ids uuid[];
  v_item_ids uuid[];
begin
  select array_agg(id) into v_trade_ids
  from (
    select id from public.trades
    where status = 'accepted' and meetup_at < now() - interval '72 hours'
    order by id
    limit 500
    for update skip locked
  ) due;
  if v_trade_ids is null then
    return 0;
  end if;

  select array_agg(toi.item_id) into v_item_ids
  from public.trades t
  join public.trade_offer_items toi on toi.offer_id = t.current_offer_id
  where t.id = any(v_trade_ids);
  perform 1 from public.items where id = any(v_item_ids) order by id for update;
  update public.items set status = 'available' where id = any(v_item_ids) and status = 'reserved';

  update public.trades
  set status = 'cancelled', cancel_reason = 'meetup_expired'
  where id = any(v_trade_ids);
  return cardinality(v_trade_ids);
end;
$$;
--> statement-breakpoint

-- Daily job: deletes read notifications older than 90 days, 1,000 at a time.
create or replace function app.notifications_purge()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.notifications
  where id in (
    select id from public.notifications
    where read_at is not null and read_at < now() - interval '90 days'
    limit 1000
  );
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
--> statement-breakpoint
select cron.schedule('trades_expire_meetups', '0 19 * * *', 'select app.trades_expire_meetups()');
--> statement-breakpoint
select cron.schedule('notifications_purge', '30 19 * * *', 'select app.notifications_purge()');
