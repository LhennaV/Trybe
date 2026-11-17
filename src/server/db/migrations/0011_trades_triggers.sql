-- updated_at and audit triggers for the trade tables
-- (docs/database.md sections 7.1 and 11). All three are on the audited list.

create trigger trg_trades_updated_at
before update on public.trades
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_trade_offers_updated_at
before update on public.trade_offers
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_trade_offer_items_updated_at
before update on public.trade_offer_items
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_trades_audit
after insert or update or delete on public.trades
for each row execute function app.audit_row();
--> statement-breakpoint
create trigger trg_trade_offers_audit
after insert or update or delete on public.trade_offers
for each row execute function app.audit_row();
--> statement-breakpoint
create trigger trg_trade_offer_items_audit
after insert or update or delete on public.trade_offer_items
for each row execute function app.audit_row();
