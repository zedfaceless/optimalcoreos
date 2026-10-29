-- The `/devside` allowlist.
--
-- A Supabase Auth account is not permission to read leads: only a row here, with
-- `is_active`, makes somebody an admin (PRD §12.2). Accounts are created by hand in
-- the dashboard with signups disabled, so this table is the second gate and the one
-- the console actually checks.
--
-- Like the two form tables, RLS is on with no policy and the grants are revoked:
-- `app/devside/**` reads it with the service key after verifying the session, and
-- nothing else may read it at all. A policy here would be a policy somebody could
-- reach with an anon key.

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The Supabase Auth user, deleted with it. An allowlist row that outlives its
  -- account would be a hole waiting for the address to be re-registered.
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254 and position('@' in email) > 1),
  display_name text check (char_length(display_name) <= 120),
  role text not null default 'staff' check (role in ('owner', 'staff')),
  is_active boolean not null default true
);

create index if not exists admin_users_user_id_idx on public.admin_users (user_id);
create index if not exists admin_users_email_idx on public.admin_users (lower(email));

create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon, authenticated;
grant all on public.admin_users to service_role;
