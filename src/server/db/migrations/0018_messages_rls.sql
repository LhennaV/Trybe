-- Chat: who may read messages live, and turning on Realtime for them
-- (TRD section 12, docs/database.md section 10, AGENTS.md rule 3).
--
-- messages is the only table the browser and the app read directly, through
-- Supabase Realtime. Writes still go only through the API: there are no
-- insert, update, or delete policies.

create trigger trg_messages_updated_at
before update on public.messages
for each row execute function app.set_updated_at();
--> statement-breakpoint

-- A small schema for functions that RLS policies call. Policies run as the
-- signed-in user, who can't use the app schema, so the helper lives here
-- instead. Not an exposed API schema: it can't be called over the REST API.
create schema if not exists rls;
--> statement-breakpoint
revoke all on schema rls from public, anon;
--> statement-breakpoint
grant usage on schema rls to authenticated;
--> statement-breakpoint
alter default privileges in schema rls revoke execute on functions from public, anon, authenticated;
--> statement-breakpoint

-- True when the signed-in user is one of the two people in the trade.
-- security definer, on purpose (docs/database.md section 5.2 rule 6): trades
-- has RLS with no policies, so a policy can't look at it as the signed-in
-- user. It only answers yes or no about the caller's own membership.
-- TODO(Phase 5): also false when either person blocked the other.
create or replace function rls.is_trade_member(p_trade_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trades t
    where t.id = p_trade_id
      and (select auth.uid()) in (t.initiator_id, t.recipient_id)
  );
$$;
--> statement-breakpoint
revoke execute on function rls.is_trade_member(uuid) from public, anon;
--> statement-breakpoint
grant execute on function rls.is_trade_member(uuid) to authenticated;
--> statement-breakpoint

create policy messages_select_trade_members
on public.messages
for select
to authenticated
using (rls.is_trade_member(trade_id));
--> statement-breakpoint

-- Realtime sends new rows of tables in this publication, filtered by the
-- policy above. Guarded so it runs on any Supabase project, local or hosted.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
     ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
