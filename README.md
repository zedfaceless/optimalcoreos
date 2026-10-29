# Optimal Core OS — website and lead console

The marketing site for Optimal Core OS (Next.js 16, App Router), the two public form
endpoints behind it, and `/devside`: the console where the owners read the quotes and
messages those forms produce.

- Next.js 16.4 (Turbopack), React 19, TypeScript 6, Tailwind 4
- Supabase: Postgres for the three tables, Auth for the console's sign-in
- Zod for every request body, Resend for notifications, `next/og` for the icon set and the
  social card (no raster assets)
- Vitest for the unit tests

## Prerequisites

- Node 24 (`.nvmrc`), pnpm 12 through `corepack enable`
- Docker (for the local Supabase stack)
- The Supabase CLI — `brew install supabase/tap/supabase`, or `npx supabase`

## Setup

```bash
pnpm install
supabase start                 # Postgres 17, Auth, Studio, Mailpit — first run pulls images
supabase db reset              # migrations, then supabase/seed.sql
cp .env.example .env.local     # then fill it in; see "Environment" below
supabase status                # prints the API URL, anon key and service_role key
pnpm dev                       # http://localhost:3000
```

`supabase db reset` also seeds two admins, six leads and three messages, so the console is
usable the moment the stack is up: **owner@demo.local** (owner — Team and Audit pages) and
**staff@demo.local** (staff — leads and messages only), both with the password
`demo-local-1234`. The fixture is `supabase/seed.sql`; nothing in it is product data and
production never runs it.

`.env.local` is ignored by git; `.env.example` lists every key the code reads and what an
empty one costs. `docs/PLACEHOLDERS.md` holds the values only the owner can supply — domain,
phone, hours, retention period, sending domain — and says where each one is consumed.

`supabase start` binds 54321–54329. If another project's stack is already up, stop it first
or edit `[api] port` and friends in `supabase/config.toml`; the app reads whatever
`NEXT_PUBLIC_SUPABASE_URL` says, so a moved port is a one-line change in `.env.local`.

## The first owner admin

The console has no signup. An account is only an admin if a row in `public.admin_users`
says so, and that table has no client-facing policy — it is read with the service key after
the session is checked.

Locally there is nothing to do: the seed writes that row. On a hosted project the first one
is still made by hand, because inviting needs somebody who is already allowed in:

1. Open the project's dashboard → **Authentication → Add user**. Set an email and a password
   of at least 12 characters (`minimum_password_length = 12` in `supabase/config.toml`, and
   the same in the dashboard). `enable_signup = false` is deliberate; a signup form would
   create an account the allowlist then refuses.
2. Copy the new user's id and insert the allowlist row:

```sql
insert into public.admin_users (user_id, email, display_name, role)
values ('<uuid from the dashboard>', 'you@example.com', 'Your Name', 'owner');
```

3. Sign in at `/devside`. From then on, everybody else is invited from **`/devside/team`**,
which sends Supabase's invitation email and writes the allowlist row itself.

`role` is `owner` or `staff`; `is_active` defaults to true, and setting it to false ends that
person's access at their next page load — `requireAdmin()` re-reads the row on every request
rather than trusting the cookie.

## Migrations

```bash
supabase migration new add_something   # creates a timestamped file; never edit an applied one
supabase db reset                      # local: rebuild from scratch
supabase link --project-ref <ref>      # once, per project
supabase db push                       # apply pending migrations to the linked project
supabase db push --dry-run --linked    # what that would do, without doing it
```

The three tables that exist (`quote_requests`, `contact_messages`, `admin_users`) carry RLS
with **no policy at all** and have their grants revoked from `anon` and `authenticated`:
the service key is the only way in, and it is only ever used on the server.

## Environment

Every key is documented in `.env.example`. The four that a deploy cannot work without:

| Key | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin, no trailing slash. A build without it publishes `http://localhost:3000` into `sitemap.xml`, `robots.txt` and every email link. |
| `NEXT_PUBLIC_SUPABASE_URL` | public | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Console sign-in only |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | The forms' inserts and every console read. Never `NEXT_PUBLIC_`, never in a client component. |

Then `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_NOTIFY_EMAIL` for the notifications (the row is
saved whether or not the mail goes out), `IP_HASH_SALT` before real traffic, and the
`CONTACT_PUBLIC_*` trio the site prints.

## Checks

```bash
pnpm check         # tsc --noEmit, eslint, vitest, then check:config
pnpm test          # vitest: schemas, guards, formatters, the console's pure helpers
pnpm check:config  # asserts the Auth settings in supabase/config.toml and the template files
pnpm build         # the real gate: server actions, next/og routes, headers
```

`pnpm build` is the one that catches the failures typecheck cannot see — a `next/og` route
that calls a Node API, a server-only module imported into a client component (that one is a
build error by design), a route handler whose export shape Next rejects.

## Deploy

1. Create the hosted Supabase project, set the region close to the visitors (`sin1` is the
   recommendation for a Philippines-based operation), and copy its keys into Vercel.
2. In the hosted project's dashboard, match the local stack: **Authentication → Sign In /
   Providers → disable "Allow new users to sign up"**, and **Auth → Settings → minimum
   password length 12**. These two live in the dashboard, not in this repository, and a
   hosted project that keeps the defaults accepts what `supabase/config.toml` rejects.
   Disable the signup *toggle*, not the Email *provider*: the provider is
   `GOTRUE_EXTERNAL_EMAIL_ENABLED`, and with it off GoTrue answers every password grant
   with "Email logins are disabled", so nobody can reach `/devside` at all.
3. `supabase link --project-ref <ref>` then `supabase db push`.
4. Import the repository into Vercel, set the same environment variables for Production and
   Preview, and deploy. Set `NEXT_PUBLIC_SITE_URL` per environment so a preview links to
   itself.
5. Insert the first `public.admin_users` row in the hosted database, then sign in at
   `/devside`.
6. Verify a deploy: `curl -sI https://<domain>/devside | grep -i x-robots-tag` should answer
   `noindex, nofollow, noarchive`, and `curl -s https://<domain>/sitemap.xml` should list the
   real origin, not localhost.

## Rotating keys

| Key | How |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` / anon key | Supabase dashboard → Project Settings → API → rotate, then update Vercel and redeploy. Both keys are read at request time, so no rebuild is needed for the server-side one; the anon key is inlined into the browser bundle, so it does. |
| `IP_HASH_SALT` | Change it in Vercel and redeploy. Yesterday's `ip_hash` values stop matching today's, which is the point of a rotation and also its cost: the per-address rate limit forgets everyone. |
| `RESEND_API_KEY` | Resend dashboard → API keys → revoke and create, then update Vercel. An expired key degrades to "saved but not emailed"; nothing throws. |
| Admin passwords | Supabase dashboard → Authentication → Users, or send a recovery email from there. There is no in-app reset page yet (`docs/PLACEHOLDERS.md`, "Recorded gaps"). |
| Removing a person | `update public.admin_users set is_active = false` — the next request they make is refused and their session is signed out. Deleting the Auth user also works and cascades. |

## Where things are

| Path | What lives there |
| --- | --- |
| `app/(site)/**` | The public pages: home, solutions, services, how-we-work, why-us, about, contact, request-quote, privacy, terms |
| `app/api/quote`, `app/api/contact` | The two POST endpoints: validate, throttle, honeypot, hash the IP, insert with the service key, notify |
| `app/devside/**` | The console: sign-in, dashboard, leads, lead detail, messages, CSV export |
| `app/{icon,apple-icon,opengraph-image,manifest,sitemap,robots,not-found}` | Metadata routes, all generated |
| `content/**` | Every word of public copy, typed. Change copy here, not in a component |
| `lib/**` | Supabase clients, validation schemas, the API guard, email, devside auth and formatting, site settings |
| `components/**` | `site/` (header, footer, sections, mockups), `forms/` (quote wizard, contact form), `devside/`, `ui/` |
| `supabase/migrations/**` | The schema, in timestamped SQL |
| `docs/` | `PLACEHOLDERS.md` (what only the owner can supply, and what is deliberately unfinished), `decisions.md` (the calls made while building, and why) |

