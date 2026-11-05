-- updated_at triggers and the audit trail (docs/database.md sections 7 and 11).
-- New tables add their own triggers in their own migration.

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function app.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_users_updated_at
before update on public.users
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_hobbies_updated_at
before update on public.hobbies
for each row execute function app.set_updated_at();
--> statement-breakpoint
create trigger trg_user_hobbies_updated_at
before update on public.user_hobbies
for each row execute function app.set_updated_at();
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Audit trail
-- ---------------------------------------------------------------------------

-- Rows are never edited. Only the audit_log_purge job deletes them.
create table app.audit_log (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  record_id   uuid,
  action      text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  -- Set per transaction with set_config('app.actor_id', ...). Empty means system.
  actor_id    uuid,
  old_data    jsonb,
  new_data    jsonb,
  changed_at  timestamptz not null default now()
);
--> statement-breakpoint
create index idx_audit_log_table_record on app.audit_log (table_name, record_id);
--> statement-breakpoint
create index idx_audit_log_actor_id on app.audit_log (actor_id);
--> statement-breakpoint
create index idx_audit_log_changed_at on app.audit_log (changed_at);
--> statement-breakpoint
create or replace function app.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
-- security definer: lets triggers write to app.audit_log even though normal
-- roles have no access to the app schema (docs/database.md section 7.2).
begin
  insert into app.audit_log (table_name, record_id, action, actor_id, old_data, new_data)
  values (
    tg_table_name,
    case when tg_op = 'DELETE' then old.id else new.id end,
    tg_op,
    nullif(current_setting('app.actor_id', true), '')::uuid,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
--> statement-breakpoint
-- Of the tables so far, only users is audited (docs/database.md section 7.1).
create trigger trg_users_audit
after insert or update or delete on public.users
for each row execute function app.audit_row();
