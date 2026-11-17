CREATE TABLE "trade_offer_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_id" uuid NOT NULL,
	"item_id" uuid,
	"item_name" text NOT NULL,
	"side" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_trade_offer_items_side" CHECK ("trade_offer_items"."side" in ('initiator', 'recipient')),
	CONSTRAINT "ck_trade_offer_items_item_name" CHECK (char_length("trade_offer_items"."item_name") between 1 and 80)
);
--> statement-breakpoint
ALTER TABLE "trade_offer_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "trade_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"made_by" uuid,
	"cash_amount" integer,
	"cash_from" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_trade_offers_cash_amount" CHECK ("trade_offers"."cash_amount" between 1 and 1000000),
	CONSTRAINT "ck_trade_offers_cash_from" CHECK ("trade_offers"."cash_from" in ('initiator', 'recipient')),
	CONSTRAINT "ck_trade_offers_cash_pair" CHECK (("trade_offers"."cash_amount" is null) = ("trade_offers"."cash_from" is null))
);
--> statement-breakpoint
ALTER TABLE "trade_offers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "trades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"initiator_id" uuid,
	"recipient_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"current_offer_id" uuid,
	"cancelled_by" uuid,
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_trades_status" CHECK ("trades"."status" in ('pending', 'accepted', 'completed', 'declined', 'cancelled')),
	CONSTRAINT "ck_trades_cancel_reason" CHECK ("trades"."cancel_reason" in ('withdrawn', 'no_show', 'item_unavailable', 'meetup_expired')),
	CONSTRAINT "ck_trades_not_self" CHECK ("trades"."initiator_id" <> "trades"."recipient_id"),
	CONSTRAINT "ck_trades_cancel_reason_when_cancelled" CHECK (("trades"."status" = 'cancelled') = ("trades"."cancel_reason" is not null))
);
--> statement-breakpoint
ALTER TABLE "trades" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "trade_offer_items" ADD CONSTRAINT "trade_offer_items_offer_id_trade_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."trade_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_offer_items" ADD CONSTRAINT "trade_offer_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_offers" ADD CONSTRAINT "trade_offers_made_by_users_id_fk" FOREIGN KEY ("made_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_initiator_id_users_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_current_offer_id_trade_offers_id_fk" FOREIGN KEY ("current_offer_id") REFERENCES "public"."trade_offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_cancelled_by_users_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_trade_offer_items_offer_id_item_id" ON "trade_offer_items" USING btree ("offer_id","item_id");--> statement-breakpoint
CREATE INDEX "idx_trade_offer_items_item_id" ON "trade_offer_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_trade_offers_trade_id_created_at" ON "trade_offers" USING btree ("trade_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_trade_offers_made_by" ON "trade_offers" USING btree ("made_by");--> statement-breakpoint
CREATE INDEX "idx_trades_initiator_id_status" ON "trades" USING btree ("initiator_id","status");--> statement-breakpoint
CREATE INDEX "idx_trades_recipient_id_status" ON "trades" USING btree ("recipient_id","status");--> statement-breakpoint
CREATE INDEX "idx_trades_current_offer_id" ON "trades" USING btree ("current_offer_id");--> statement-breakpoint
CREATE INDEX "idx_trades_cancelled_by" ON "trades" USING btree ("cancelled_by");