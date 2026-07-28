-- ============================================================
-- Authentication schema for the portfolio site
-- Run this once in the Supabase SQL editor (or via the CLI:
-- supabase db execute -f supabase/auth_schema.sql)
--
-- Supabase already manages the actual user accounts, password
-- hashes, and sessions in its internal `auth.users` table — you
-- never touch that table directly. This script only adds the
-- public-facing `profiles` table that your app reads/writes
-- (src/pages/Profile.tsx, src/pages/Dashboard.tsx), plus the
-- automation and security rules that keep it in sync and safe.
-- ============================================================

-- 1. Table: one row per authenticated user, keyed to auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique,
  full_name   text,
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile data for each authenticated user. 1:1 with auth.users.';

-- Basic sanity constraints
alter table public.profiles
  add constraint username_length check (username is null or char_length(username) >= 3);

-- 2. Keep updated_at current on every row change
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3. Auto-create a profile row the moment someone signs up
--    (fires on auth.users insert, i.e. supabase.auth.signUp()).
--    security definer lets it write to public.profiles even
--    though the new user doesn't have a session/RLS grant yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    -- default username: text before the @ in their email
    split_part(new.email, '@', 1),
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Row Level Security — lock the table down, then open narrow,
--    explicit gaps. Nobody can read or write another user's row.
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Belt-and-suspenders: also allow a user to insert their own row
-- directly (the trigger above normally does this on signup, but
-- this covers any account created before the trigger existed).
drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Deliberately no delete policy: users cannot delete their own
-- profile row from the client. Deleting the auth.users row (e.g.
-- via the Supabase dashboard or an admin API call) cascades and
-- removes it automatically, per the foreign key above.

-- ============================================================
-- Optional but recommended, in the Supabase dashboard:
--   Authentication -> Providers -> Email
--     - "Confirm email" on if you want email verification before
--       first sign-in (src/pages/AuthPage.tsx already handles the
--       "check your email" case when this is on).
--   Authentication -> Rate Limits
--     - keep the default sign-in / sign-up limits enabled to slow
--       down brute-force attempts.
-- ============================================================
