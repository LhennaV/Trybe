-- Ratings: triggers, the submit function, and the reveal job
-- (docs/database.md sections 5, 7, and 8; TRD RATE-01 and RATE-02).

create trigger trg_ratings_updated_at
before update on public.ratings
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_ratings_audit
after insert or update or delete on public.ratings
for each row execute function app.audit_row();
--> statement-breakpoint

-- POST /api/trades/:id/ratings (RATE-01). One rating per person per completed
-- trade. The trade row is locked first, so the two people rating at the same
-- moment are handled one after the other, and the second one reveals both
-- (RATE-02). Returns the new rating's id.
create or replace function app.rating_submit(
  p_trade_id uuid,
  p_actor_id uuid,
  p_score integer,
  p_tags text[],
  p_note text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
  v_ratee_id uuid;
  v_rating_id uuid;
begin
  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  if v_trade.status <> 'completed' then
    raise exception 'TRADE_NOT_COMPLETED' using errcode = 'P0001';
  end if;

  v_ratee_id := case when p_actor_id = v_trade.initiator_id then v_trade.recipient_id else v_trade.initiator_id end;
  if v_ratee_id is null then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001',
      detail = 'They deleted their account, so there''s no one to rate.';
  end if;

  if exists (select 1 from public.ratings where trade_id = p_trade_id and rater_id = p_actor_id) then
    raise exception 'ALREADY_RATED' using errcode = 'P0001';
  end if;

  insert into public.ratings (trade_id, rater_id, ratee_id, score, tags, note)
  values (p_trade_id, p_actor_id, v_ratee_id, p_score, coalesce(p_tags, '{}'), nullif(p_note, ''))
  returning id into v_rating_id;

  -- Both are in: show both now instead of waiting for the job.
  if exists (select 1 from public.ratings where trade_id = p_trade_id and rater_id = v_ratee_id) then
    update public.ratings set visible_at = now() where trade_id = p_trade_id and visible_at is null;
  end if;

  return v_rating_id;
end;
$$;
--> statement-breakpoint

-- The hourly ratings_reveal job (RATE-02): shows ratings that have waited
-- 7 days (Proposed) for the other person. Safe to run twice; at most 1,000
-- rows a run, and rows another transaction holds are left for the next run.
-- Returns how many it revealed.
create or replace function app.ratings_reveal()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  with due as (
    select id
    from public.ratings
    where visible_at is null and created_at <= now() - interval '7 days'
    order by created_at
    limit 1000
    for update skip locked
  )
  update public.ratings r
  set visible_at = now()
  from due
  where r.id = due.id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
--> statement-breakpoint

-- First scheduled job, so pg_cron is turned on here (docs/database.md
-- section 8, never by clicking in the dashboard). cron.schedule with a name
-- replaces a job of the same name, so re-running is safe.
create extension if not exists pg_cron with schema pg_catalog;
--> statement-breakpoint
select cron.schedule('ratings_reveal', '0 * * * *', 'select app.ratings_reveal()');
