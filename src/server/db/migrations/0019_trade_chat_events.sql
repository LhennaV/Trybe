-- Offer cards and system messages in the trade chat, written automatically
-- (Phase 4, CHAT-01). Triggers, so every way a trade changes writes them:
-- the trade functions, the deleted-item trigger, and future jobs alike, in
-- the same transaction as the change.

-- Every offer and counter shows up in the chat as an offer card from the
-- person who made it.
create or replace function app.messages_offer_card()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.messages (trade_id, sender_id, type, offer_id)
  values (new.trade_id, new.made_by, 'offer', new.id);
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_trade_offers_chat_card
after insert on public.trade_offers
for each row execute function app.messages_offer_card();
--> statement-breakpoint

-- A short system line when a trade changes status. Written without names, so
-- it reads right for both people and after an account is deleted; the app
-- already knows who is who from the trade.
create or replace function app.messages_status_line()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_body text;
begin
  v_body := case new.status
    when 'accepted' then 'Offer accepted! The items are reserved. Set up a meetup next.'
    when 'declined' then 'Offer declined.'
    when 'completed' then 'Trade completed! Don''t forget to rate each other.'
    when 'cancelled' then case new.cancel_reason
      when 'no_show' then 'Trade cancelled: someone didn''t show up.'
      when 'item_unavailable' then 'Trade cancelled: an item is no longer available.'
      when 'meetup_expired' then 'Trade cancelled: the meetup time passed.'
      else 'Trade cancelled.'
    end
  end;

  if v_body is not null then
    insert into public.messages (trade_id, type, body) values (new.id, 'system', v_body);
  end if;
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_trades_chat_status
after update of status on public.trades
for each row
when (old.status is distinct from new.status)
execute function app.messages_status_line();
