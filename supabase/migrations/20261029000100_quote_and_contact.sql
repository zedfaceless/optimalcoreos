-- Quote requests and contact messages.
--
-- The two public forms write through the route handlers in `app/api/*`, which use
-- the service key; browsers never talk to Postgres. RLS is therefore on with **no
-- policy for anon or authenticated**, and the grants are revoked: a request that
-- reached the table without going through validation in `lib/validation/forms.ts`
-- would be a bug, so there is no path for one. `app/devside` reads both tables with
-- the same service key behind its own sign-in and its own allowlist.
--
-- The check constraints repeat the zod rules on purpose. The form is the first gate,
-- the route handler is the second; these are the ones that hold even if a future
-- caller forgets both.

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  business_name text not null check (char_length(business_name) between 2 and 160),
  email text not null check (char_length(email) between 3 and 254 and position('@' in email) > 1),
  phone text check (char_length(phone) <= 40),
  role text check (char_length(role) <= 80),
  country text not null check (country ~ '^[A-Z]{2}$'),
  project_type text not null,
  description text not null check (char_length(description) between 20 and 5000),
  expected_users text not null,
  timeline text not null,
  budget text not null,
  -- The day and the wall-clock time as the studio offered them (Asia/Manila); the
  -- visitor's zone travels beside them so a confirmation email can say both.
  preferred_date date not null,
  preferred_time time not null,
  timezone text not null check (char_length(timezone) between 1 and 64),
  meeting_platform text not null check (meeting_platform in ('google_meet', 'zoom', 'teams', 'any')),
  consent boolean not null default false check (consent),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  user_agent text,
  -- Hashed in `lib/supabase/admin.ts`; the raw address is never stored.
  ip_hash text,
  -- Moved by hand in /devside as the conversation progresses.
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam')),
  internal_notes text
);

-- No uniqueness on (email, preferred_date, preferred_time): somebody whose first
-- request bounced back often re-sends the same slot, and a 503 for a duplicate would
-- read as an outage. The rate limit in `lib/api/guard.ts` is what stops flooding.

create index if not exists quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index if not exists quote_requests_status_idx on public.quote_requests (status, created_at desc);
create index if not exists quote_requests_email_idx on public.quote_requests (lower(email));

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254 and position('@' in email) > 1),
  message text not null check (char_length(message) between 10 and 4000),
  referrer text,
  user_agent text,
  ip_hash text,
  status text not null default 'new' check (status in ('new', 'replied', 'archived', 'spam')),
  internal_notes text
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);
