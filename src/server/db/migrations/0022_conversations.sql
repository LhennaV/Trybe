CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_a_id" uuid NOT NULL,
	"user_b_id" uuid NOT NULL,
	"started_by" uuid NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_conversations_pair_order" CHECK ("conversations"."user_a_id" < "conversations"."user_b_id"),
	CONSTRAINT "ck_conversations_started_by" CHECK ("conversations"."started_by" in ("conversations"."user_a_id", "conversations"."user_b_id")),
	CONSTRAINT "ck_conversations_status" CHECK ("conversations"."status" in ('requested', 'accepted', 'declined'))
);
--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "trade_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "conversation_id" uuid;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_started_by_users_id_fk" FOREIGN KEY ("started_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_conversations_user_a_id_user_b_id" ON "conversations" USING btree ("user_a_id","user_b_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_user_a_id_last_message_at" ON "conversations" USING btree ("user_a_id","last_message_at");--> statement-breakpoint
CREATE INDEX "idx_conversations_user_b_id_last_message_at" ON "conversations" USING btree ("user_b_id","last_message_at");--> statement-breakpoint
CREATE INDEX "idx_conversations_started_by" ON "conversations" USING btree ("started_by");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id_created_at" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "ck_messages_one_thread" CHECK (("messages"."trade_id" is null) <> ("messages"."conversation_id" is null));--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "ck_messages_conversation_text" CHECK ("messages"."conversation_id" is null or "messages"."type" = 'text');