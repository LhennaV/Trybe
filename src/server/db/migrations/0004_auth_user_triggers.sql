-- Keeps public.users in step with Supabase Auth (auth.users).
--
-- 1. Sign up: create the profile row in the same transaction as the account.
--    If it fails (terms not accepted, bad or taken handle), the sign up fails
--    too, so there is never an account without a profile. This also covers
--    sign ups that call Supabase Auth directly with the public anon key.
-- 2. Email verified or changed: copy it to public.users.

create or replace function app.auth_user_create_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
-- security definer: Supabase Auth inserts into auth.users as its own role
-- (supabase_auth_admin), which can't write to public.users. The function runs
-- as its owner instead. It only ever writes the row for the new account.
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  -- AUTH-03, AUTH-04: both must be exactly true. Anything else refuses the sign up.
  if (v_meta -> 'terms_accepted') is distinct from 'true'::jsonb
     or (v_meta -> 'age_confirmed') is distinct from 'true'::jsonb then
    raise exception 'TERMS_NOT_ACCEPTED' using errcode = 'P0001';
  end if;

  -- Handle format, length, and display name length are enforced by the
  -- check constraints on public.users; uniqueness by uq_users_handle.
  insert into public.users (
    id, email, email_verified, display_name, handle, age_confirmed_at, terms_accepted_at
  )
  values (
    new.id,
    new.email,
    new.email_confirmed_at is not null,
    btrim(v_meta ->> 'display_name'),
    lower(btrim(v_meta ->> 'handle')),
    now(),
    now()
  );

  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_auth_users_create_profile
after insert on auth.users
for each row execute function app.auth_user_create_profile();
--> statement-breakpoint
create or replace function app.auth_user_sync_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
-- security definer: same reason as app.auth_user_create_profile.
begin
  update public.users
  set email = new.email,
      email_verified = new.email_confirmed_at is not null
  where id = new.id;
  return new;
end;
$$;
--> statement-breakpoint
create trigger trg_auth_users_sync_profile
after update of email, email_confirmed_at on auth.users
for each row
when (
  old.email is distinct from new.email
  or old.email_confirmed_at is distinct from new.email_confirmed_at
)
execute function app.auth_user_sync_profile();
