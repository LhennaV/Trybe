-- Message requests (CHAT-02, decided 2026-11-23): triggers for conversations,
-- and the messages read policy now also covers conversations, so both people
-- get new direct messages live through Realtime (TRD section 12).

create trigger trg_conversations_updated_at
before update on public.conversations
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_conversations_audit
after insert or update or delete on public.conversations
for each row execute function app.audit_row();
--> statement-breakpoint

-- True when the signed-in user is one of the two people in the
-- conversation. security definer for the same reason as
-- rls.is_trade_member (migration 0018): conversations has RLS with no
-- policies. TODO(Phase 5): also false when either person blocked the other.
create or replace function rls.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = p_conversation_id
      and (select auth.uid()) in (c.user_a_id, c.user_b_id)
  );
$$;
--> statement-breakpoint
revoke execute on function rls.is_conversation_member(uuid) from public, anon;
--> statement-breakpoint
grant execute on function rls.is_conversation_member(uuid) to authenticated;
--> statement-breakpoint

drop policy if exists messages_select_trade_members on public.messages;
--> statement-breakpoint
create policy messages_select_members
on public.messages
for select
to authenticated
using (
  case
    when trade_id is not null then rls.is_trade_member(trade_id)
    else rls.is_conversation_member(conversation_id)
  end
);
