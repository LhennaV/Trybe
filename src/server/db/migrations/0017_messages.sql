CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"sender_id" uuid,
	"type" text NOT NULL,
	"body" text,
	"offer_id" uuid,
	"asks_for_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_messages_type" CHECK ("messages"."type" in ('text', 'offer', 'system')),
	CONSTRAINT "ck_messages_body_length" CHECK (char_length("messages"."body") between 1 and 1000),
	CONSTRAINT "ck_messages_shape" CHECK (("messages"."type" = 'offer') = ("messages"."offer_id" is not null) and ("messages"."type" = 'offer' or "messages"."body" is not null))
);
--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_offer_id_trade_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."trade_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_messages_trade_id_created_at" ON "messages" USING btree ("trade_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_sender_id" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_messages_offer_id" ON "messages" USING btree ("offer_id");