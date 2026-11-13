CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hobby_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"position" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_categories_slug_format" CHECK ("categories"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "item_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_item_photos_position" CHECK ("item_photos"."position" between 0 and 3)
);
--> statement-breakpoint
ALTER TABLE "item_photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category_id" uuid NOT NULL,
	"condition" text NOT NULL,
	"up_for_trade" boolean DEFAULT false NOT NULL,
	"looking_for" text,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_items_name_length" CHECK (char_length("items"."name") between 1 and 80),
	CONSTRAINT "ck_items_looking_for_length" CHECK (char_length("items"."looking_for") <= 140),
	CONSTRAINT "ck_items_condition" CHECK ("items"."condition" in ('like_new', 'good', 'fair', 'worn')),
	CONSTRAINT "ck_items_status" CHECK ("items"."status" in ('available', 'reserved', 'traded'))
);
--> statement-breakpoint
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"path" text NOT NULL,
	"thumb_path" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_photos_size" CHECK ("photos"."width" > 0 and "photos"."height" > 0)
);
--> statement-breakpoint
ALTER TABLE "photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "post_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "post_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"position" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_post_photos_position" CHECK ("post_photos"."position" between 0 and 5)
);
--> statement-breakpoint
ALTER TABLE "post_photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hobby_id" uuid NOT NULL,
	"title" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"hidden_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_posts_title_length" CHECK (char_length("posts"."title") between 1 and 100),
	CONSTRAINT "ck_posts_caption_length" CHECK (char_length("posts"."caption") <= 2000)
);
--> statement-breakpoint
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "saves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saves" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_hobby_id_hobbies_id_fk" FOREIGN KEY ("hobby_id") REFERENCES "public"."hobbies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_photos" ADD CONSTRAINT "item_photos_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_photos" ADD CONSTRAINT "item_photos_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_items" ADD CONSTRAINT "post_items_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_items" ADD CONSTRAINT "post_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_photos" ADD CONSTRAINT "post_photos_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_photos" ADD CONSTRAINT "post_photos_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_hobby_id_hobbies_id_fk" FOREIGN KEY ("hobby_id") REFERENCES "public"."hobbies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saves" ADD CONSTRAINT "saves_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saves" ADD CONSTRAINT "saves_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_categories_hobby_id_slug" ON "categories" USING btree ("hobby_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_item_photos_photo_id" ON "item_photos" USING btree ("photo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_item_photos_item_id_position" ON "item_photos" USING btree ("item_id","position");--> statement-breakpoint
CREATE INDEX "idx_items_owner_id_status" ON "items" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "idx_items_tradeable" ON "items" USING btree ("category_id") WHERE "items"."status" = 'available' and "items"."up_for_trade";--> statement-breakpoint
CREATE INDEX "idx_items_category_id" ON "items" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_likes_user_id_post_id" ON "likes" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "idx_likes_post_id" ON "likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_photos_owner_id" ON "photos" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_photos_created_at" ON "photos" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_photos_path" ON "photos" USING btree ("path");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_items_post_id_item_id" ON "post_items" USING btree ("post_id","item_id");--> statement-breakpoint
CREATE INDEX "idx_post_items_item_id" ON "post_items" USING btree ("item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_photos_photo_id" ON "post_photos" USING btree ("photo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_post_photos_post_id_position" ON "post_photos" USING btree ("post_id","position");--> statement-breakpoint
CREATE INDEX "idx_posts_feed" ON "posts" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "posts"."hidden_at" is null;--> statement-breakpoint
CREATE INDEX "idx_posts_hobby_feed" ON "posts" USING btree ("hobby_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "posts"."hidden_at" is null;--> statement-breakpoint
CREATE INDEX "idx_posts_user_id_created_at" ON "posts" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_posts_hobby_id" ON "posts" USING btree ("hobby_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_saves_user_id_post_id" ON "saves" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "idx_saves_post_id" ON "saves" USING btree ("post_id");