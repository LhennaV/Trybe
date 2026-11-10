CREATE TABLE "hobby_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_hobby_requests_name_length" CHECK (char_length("hobby_requests"."name") between 2 and 40),
	CONSTRAINT "ck_hobby_requests_level" CHECK ("hobby_requests"."level" in ('has', 'trying'))
);
--> statement-breakpoint
ALTER TABLE "hobby_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "hobby_requests" ADD CONSTRAINT "hobby_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_hobby_requests_user_id_name" ON "hobby_requests" USING btree ("user_id",lower("name"));--> statement-breakpoint
CREATE INDEX "idx_hobby_requests_name" ON "hobby_requests" USING btree (lower("name"));--> statement-breakpoint
-- Added by hand: keep updated_at current (docs/database.md section 11).
-- Not audited: hobby requests aren't in the audited list (section 7.1).
create trigger trg_hobby_requests_updated_at
before update on public.hobby_requests
for each row execute function app.set_updated_at();
