CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"actor_id" uuid,
	"trade_id" uuid,
	"conversation_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_notifications_type" CHECK ("notifications"."type" in ('trade_proposed', 'trade_countered', 'trade_accepted', 'trade_declined', 'trade_cancelled', 'trade_completed', 'meetup_suggested', 'meetup_confirmed', 'message', 'message_request', 'rating_received'))
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id_created_at" ON "notifications" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" USING btree ("user_id") WHERE "notifications"."read_at" is null;--> statement-breakpoint
CREATE INDEX "idx_notifications_read_at" ON "notifications" USING btree ("read_at") WHERE "notifications"."read_at" is not null;--> statement-breakpoint
CREATE INDEX "idx_notifications_actor_id" ON "notifications" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_trade_id" ON "notifications" USING btree ("trade_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_conversation_id" ON "notifications" USING btree ("conversation_id");