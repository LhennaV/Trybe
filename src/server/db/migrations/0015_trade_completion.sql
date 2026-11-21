ALTER TABLE "trades" ADD COLUMN "initiator_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "recipient_confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trades" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
-- Hand-added: any trade already marked completed (only possible by hand before
-- this migration) gets a completion time, so the check below can be added.
UPDATE "trades" SET "completed_at" = "updated_at" WHERE "status" = 'completed' AND "completed_at" IS NULL;--> statement-breakpoint
ALTER TABLE "trades" ADD CONSTRAINT "ck_trades_completed_at_when_completed" CHECK (("trades"."status" = 'completed') = ("trades"."completed_at" is not null));