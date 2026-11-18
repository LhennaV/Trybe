CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" uuid NOT NULL,
	"rater_id" uuid,
	"ratee_id" uuid NOT NULL,
	"score" smallint NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"note" text,
	"visible_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_ratings_score" CHECK ("ratings"."score" between 1 and 5),
	CONSTRAINT "ck_ratings_tags" CHECK ("ratings"."tags" <@ array['Item as described', 'On time', 'Friendly', 'Easy to negotiate', 'Good meetup spot']::text[] and cardinality("ratings"."tags") <= 5),
	CONSTRAINT "ck_ratings_note_length" CHECK (char_length("ratings"."note") <= 500),
	CONSTRAINT "ck_ratings_not_self" CHECK ("ratings"."rater_id" <> "ratings"."ratee_id")
);
--> statement-breakpoint
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rater_id_users_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratee_id_users_id_fk" FOREIGN KEY ("ratee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ratings_trade_id_rater_id" ON "ratings" USING btree ("trade_id","rater_id");--> statement-breakpoint
CREATE INDEX "idx_ratings_ratee_id_visible" ON "ratings" USING btree ("ratee_id") WHERE "ratings"."visible_at" is not null;--> statement-breakpoint
CREATE INDEX "idx_ratings_hidden_created_at" ON "ratings" USING btree ("created_at") WHERE "ratings"."visible_at" is null;--> statement-breakpoint
CREATE INDEX "idx_ratings_ratee_id" ON "ratings" USING btree ("ratee_id");--> statement-breakpoint
CREATE INDEX "idx_ratings_rater_id" ON "ratings" USING btree ("rater_id");