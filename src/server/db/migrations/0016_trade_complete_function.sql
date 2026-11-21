-- Completing a trade (MEET-05, TRD section 11; docs/database.md section 5).
--
-- POST /api/trades/:id/complete. Records that the actor handed over and got
-- their items. When both people have confirmed, the trade is completed and
-- its items become traded. Safe to repeat: confirming twice changes nothing.
-- The trade row is locked first, so both people confirming at the same moment
-- complete the trade exactly once. Returns the trade's status afterwards.
create or replace function app.trade_confirm_complete(p_trade_id uuid, p_actor_id uuid)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_trade public.trades;
  v_item_ids uuid[];
begin
  v_trade := app.trade_lock(p_trade_id, p_actor_id);
  if v_trade.status <> 'accepted' then
    raise exception 'TRADE_NOT_ACCEPTED' using errcode = 'P0001';
  end if;

  if p_actor_id = v_trade.initiator_id then
    update public.trades set initiator_confirmed_at = coalesce(initiator_confirmed_at, now())
    where id = p_trade_id
    returning * into v_trade;
  else
    update public.trades set recipient_confirmed_at = coalesce(recipient_confirmed_at, now())
    where id = p_trade_id
    returning * into v_trade;
  end if;

  if v_trade.initiator_confirmed_at is null or v_trade.recipient_confirmed_at is null then
    return 'accepted'; -- waiting for the other person
  end if;

  -- Both confirmed: the items changed hands.
  select array_agg(item_id) into v_item_ids
  from public.trade_offer_items where offer_id = v_trade.current_offer_id;
  perform 1 from public.items where id = any(v_item_ids) order by id for update;
  update public.items set status = 'traded' where id = any(v_item_ids);

  update public.trades set status = 'completed', completed_at = now() where id = p_trade_id;
  return 'completed';
end;
$$;
