-- updated_at and audit triggers for the Phase 2 tables
-- (docs/database.md sections 7.1 and 11).

-- updated_at on every new table.
create trigger trg_categories_updated_at
before update on public.categories
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_photos_updated_at
before update on public.photos
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_items_updated_at
before update on public.items
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_item_photos_updated_at
before update on public.item_photos
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_posts_updated_at
before update on public.posts
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_post_photos_updated_at
before update on public.post_photos
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_post_items_updated_at
before update on public.post_items
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_likes_updated_at
before update on public.likes
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_saves_updated_at
before update on public.saves
for each row execute function app.set_updated_at();
--> statement-breakpoint

-- Audit trail: items and posts are on the audited list (section 7.1).
-- Likes, saves, photos, and the link tables are not: too frequent, or
-- already covered by their item or post.
create trigger trg_items_audit
after insert or update or delete on public.items
for each row execute function app.audit_row();
--> statement-breakpoint
create trigger trg_posts_audit
after insert or update or delete on public.posts
for each row execute function app.audit_row();
