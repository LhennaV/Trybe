-- Private schema for database functions, trigger functions, and the audit log
-- (docs/database.md section 2). Never add `app` to the exposed schemas in
-- Supabase API settings. Only the server connection uses it.

create schema if not exists app;
--> statement-breakpoint
revoke all on schema app from public, anon, authenticated;
--> statement-breakpoint
-- Postgres lets everyone execute new functions by default. Turn that off for `app`.
revoke execute on all functions in schema app from public, anon, authenticated;
--> statement-breakpoint
alter default privileges in schema app revoke execute on functions from public, anon, authenticated;
