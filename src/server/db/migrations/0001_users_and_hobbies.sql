CREATE TABLE "hobbies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_hobbies_slug_format" CHECK ("hobbies"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
ALTER TABLE "hobbies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_hobbies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hobby_id" uuid NOT NULL,
	"level" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_user_hobbies_level" CHECK ("user_hobbies"."level" in ('has', 'trying'))
);
--> statement-breakpoint
ALTER TABLE "user_hobbies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"display_name" text NOT NULL,
	"handle" text NOT NULL,
	"photo_url" text,
	"bio" text,
	"city" text,
	"message_permission" text DEFAULT 'anyone' NOT NULL,
	"age_confirmed_at" timestamp with time zone NOT NULL,
	"terms_accepted_at" timestamp with time zone NOT NULL,
	"suspended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_users_handle_format" CHECK ("users"."handle" ~ '^[a-z0-9_]+(\.[a-z0-9_]+)*$'),
	CONSTRAINT "ck_users_handle_length" CHECK (char_length("users"."handle") between 3 and 20),
	CONSTRAINT "ck_users_display_name_length" CHECK (char_length("users"."display_name") between 1 and 50),
	CONSTRAINT "ck_users_bio_length" CHECK (char_length("users"."bio") <= 160),
	CONSTRAINT "ck_users_city_length" CHECK (char_length("users"."city") between 1 and 60),
	CONSTRAINT "ck_users_message_permission" CHECK ("users"."message_permission" in ('anyone', 'traded_only'))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_hobbies" ADD CONSTRAINT "user_hobbies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hobbies" ADD CONSTRAINT "user_hobbies_hobby_id_hobbies_id_fk" FOREIGN KEY ("hobby_id") REFERENCES "public"."hobbies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_hobbies_slug" ON "hobbies" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_hobbies_user_id_hobby_id" ON "user_hobbies" USING btree ("user_id","hobby_id");--> statement-breakpoint
CREATE INDEX "idx_user_hobbies_hobby_id" ON "user_hobbies" USING btree ("hobby_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_handle" ON "users" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "idx_users_city" ON "users" USING btree ("city");