CREATE TABLE "meetup_spots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ck_meetup_spots_lat" CHECK ("meetup_spots"."lat" between -90 and 90),
	CONSTRAINT "ck_meetup_spots_lng" CHECK ("meetup_spots"."lng" between -180 and 180)
);
--> statement-breakpoint
ALTER TABLE "meetup_spots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "meetup_spot_id" uuid;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "meetup_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "meetup_proposed_by" uuid;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "meetup_confirmed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_meetup_spots_city_active" ON "meetup_spots" USING btree (lower("city")) WHERE "meetup_spots"."active";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_meetup_spots_city_name" ON "meetup_spots" USING btree ("city","name");--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_meetup_spot_id_meetup_spots_id_fk" FOREIGN KEY ("meetup_spot_id") REFERENCES "public"."meetup_spots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "trades_meetup_proposed_by_users_id_fk" FOREIGN KEY ("meetup_proposed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_trades_meetup_at_accepted" ON "trades" USING btree ("meetup_at") WHERE "trades"."status" = 'accepted';--> statement-breakpoint
CREATE INDEX "idx_trades_meetup_spot_id" ON "trades" USING btree ("meetup_spot_id");--> statement-breakpoint
CREATE INDEX "idx_trades_meetup_proposed_by" ON "trades" USING btree ("meetup_proposed_by");--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "ck_trades_meetup_pair" CHECK (("trades"."meetup_spot_id" is null) = ("trades"."meetup_at" is null));