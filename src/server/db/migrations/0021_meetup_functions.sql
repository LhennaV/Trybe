-- Meetups (MEET-01, MEET-02; docs/database.md section 5): triggers, the
-- first safe spots, the suggest and confirm functions, and chat lines.

create trigger trg_meetup_spots_updated_at
before update on public.meetup_spots
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_meetup_spots_audit
after insert or update or delete on public.meetup_spots
for each row execute function app.audit_row();
--> statement-breakpoint

-- The first city's spots. Same ids as the meetup screen's sample data, so the
-- screen keeps working when it switches to GET /api/meetup-spots.
insert into public.meetup_spots (id, city, name, description, lat, lng) values
  ('5b0d6c1e-3f7a-4c2e-9a51-0e8f4d2b7c01', 'Quezon City', 'Trinoma Mall · main entrance',
   'Suggested safe spot · public, CCTV, guards', 14.6535, 121.0335),
  ('5b0d6c1e-3f7a-4c2e-9a51-0e8f4d2b7c02', 'Quezon City', 'Quezon Memorial Circle · park gate',
   'Suggested safe spot · open area, daylight only', 14.6517, 121.0494)
on conflict (id) do nothing;
--> statement-breakpoint

-- POST /api/trades/:id/meetup (MEET-01). Either person suggests a spot and a
-- time once the trade is accepted. A new suggestion replaces the old one and
-- needs confirming again. The suggester counts as confirmed.
create or replace function app.trade_set_meetup(
  p_trade_id uuid,
  p_actor_id uuid,
  p_spot_id uuid,
  p_meetup_at timestamptz
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
begin
  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  if v_trade.status <> 'accepted' then
    raise exception 'TRADE_NOT_ACCEPTED' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.meetup_spots where id = p_spot_id and active) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001', detail = 'Pick a spot from the list.';
  end if;
  if p_meetup_at <= now() then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001', detail = 'Pick a time that hasn''t passed yet.';
  end if;
  if p_meetup_at > now() + interval '60 days' then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001', detail = 'Pick a time in the next 60 days.';
  end if;

  update public.trades
  set meetup_spot_id = p_spot_id,
      meetup_at = p_meetup_at,
      meetup_proposed_by = p_actor_id,
      meetup_confirmed_at = null
  where id = p_trade_id;
end;
$$;
--> statement-breakpoint

-- POST /api/trades/:id/meetup/confirm (MEET-01). The other person agrees to
-- the suggested spot and time. Safe to repeat.
create or replace function app.trade_confirm_meetup(p_trade_id uuid, p_actor_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
begin
  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  if v_trade.status <> 'accepted' then
    raise exception 'TRADE_NOT_ACCEPTED' using errcode = 'P0001';
  end if;
  if v_trade.meetup_spot_id is null then
    raise exception 'CONFLICT' using errcode = 'P0001', detail = 'There''s no meetup to confirm yet.';
  end if;
  if v_trade.meetup_proposed_by = p_actor_id then
    raise exception 'FORBIDDEN' using errcode = 'P0001',
      detail = 'You suggested this meetup. Wait for them to confirm it.';
  end if;
  if v_trade.meetup_at <= now() then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001',
      detail = 'That time has passed. Suggest a new one.';
  end if;

  update public.trades
  set meetup_confirmed_at = coalesce(meetup_confirmed_at, now())
  where id = p_trade_id;
end;
$$;
--> statement-breakpoint

-- Chat lines for meetups, like the status lines in migration 0019. Times are
-- shown in Philippine time, where every Trybe city is.
create or replace function app.messages_meetup_line()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_body text;
begin
  if new.meetup_spot_id is distinct from old.meetup_spot_id or new.meetup_at is distinct from old.meetup_at then
    select 'Meetup suggested: ' || s.name || ', '
           || to_char(new.meetup_at at time zone 'Asia/Manila', 'FMMon FMDD, FMHH12:MI AM') || '.'
    into v_body
    from public.meetup_spots s
    where s.id = new.meetup_spot_id;
  elsif old.meetup_confirmed_at is null and new.meetup_confirmed_at is not null then
    v_body := 'Meetup confirmed. See you there!';
  end if;

  if v_body is not null then
    insert into public.messages (trade_id, type, body) values (new.id, 'system', v_body);
  end if;
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_trades_chat_meetup
after update of meetup_spot_id, meetup_at, meetup_confirmed_at on public.trades
for each row execute function app.messages_meetup_line();
