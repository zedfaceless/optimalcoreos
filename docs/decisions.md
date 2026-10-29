# Decisions

The PRD asks (line "If a requirement is ambiguous…") that a judgement call be written down
rather than made silently. These are the calls made while building, the alternative that was
rejected, and what would change the answer. `docs/PLACEHOLDERS.md` is the companion list of
what is still missing; this file is why what exists looks the way it does.

## The database

**Three tables, no policy, grants revoked.** `quote_requests`, `contact_messages` and
`admin_users` have RLS enabled with **zero policies** and no privileges for `anon` or
`authenticated`. Every read and write goes through the service key on the server.

The alternative — a policy letting `anon` insert and `service_role` read — was rejected
because `create policy ... for insert to anon` also means any script that knows the project
URL can write rows, and the only thing standing between it and the table would be the rate
limiter, which is in memory. With the grant revoked, a browser has no path at all. The cost
is that the public forms cannot use the anon key, so the server needs the service key; that
trade is made once, in `lib/api/*` and `lib/devside/*`, both `server-only`.

**`internal_notes` on the two lead tables, not a notes table.** A note is one person's aside on
one row; the console shows the latest and the CSV exports it. A `lead_notes` table with an
author and a timestamp is the right shape once two people edit the same lead, and the PRD's
`lead_activities` is that table. Building half of it now would mean migrating the half later.

**An allowlist row, not a claim in the JWT.** `admin_users` decides who is an admin, and
`requireAdmin()` re-reads it on every request. A custom claim would be faster — the check is
one indexed lookup — but a claim lives in a token that stays valid until it expires, so
deactivating somebody would not take effect until their next refresh. A row that says
`is_active = false` is a door that closes on the next click.

**No unique constraint on (email, preferred_date, preferred_time).** A visitor who is not
sure their first submission went through submits again, and refusing the second with a
constraint error teaches them the site is broken. Both rows are saved and the console shows
both; the throttle stops a rapid double-submit, which is the real case.

## The console

**No `middleware.ts`.** §14.5 asks for one on `/devside/:path*`. The headers it would add
(`X-Robots-Tag`, `Cache-Control: no-store`) are set in `next.config.ts` `headers()`, where
a matcher typo cannot exempt a page, and the authorization check it describes has to read
`admin_users` — a database call the edge cannot make. So the gate is `requireAdmin()` on
every page and every action, and middleware would only make the redirect for an anonymous
visitor arrive sooner. Documented as a gap rather than half-built.

**`force-dynamic` on every devside segment.** Without it, a build in an environment with no
Supabase keys prerenders the console as "not configured" and serves that HTML afterwards.
`cookies()` happens to opt a page out of static rendering, but only when the client is
actually constructed, so the guarantee would have depended on an env var being present at
build time. The export says it out loud instead.

**`/devside` is kept out of `robots.txt`.** `Disallow: /devside` publishes the path to anyone
reading the file. The path is unguessable enough, it answers `noindex` on every response, and
the login page has nothing to crawl.

**The CSV endpoint answers 401, not a redirect.** A redirect to `/devside` would hand a
`fetch()` an HTML login page with a 200 after following it — the failure mode where somebody
saves a `.csv` full of login markup. It also carries a BOM (Excel and the peso sign) and
prefixes any cell starting with `=`, `+`, `-` or `@` with `'`, because a lead's description
is text a stranger wrote.

## The public site

**Static pages, generated assets.** Every marketing page is statically rendered; the only
dynamic routes are the two form endpoints, `/request-quote` (it reads `searchParams` for UTM)
and the console. Icons, the Apple icon and the social card are drawn at build time with
`next/og` — no PNG in the repository, so there is no second copy of the mark to keep in sync.

**The rate limit is in memory.** §15.4 specifies a `rate_limits` table with an atomic
upsert. A `Map` per instance is what shipped: it stops a double-submit and a bored script,
it needs no migration, and it cannot fail closed on a database hiccup. On Vercel it does not
protect the second warm function, which is recorded in `docs/PLACEHOLDERS.md` rather than
described as done.

**`[db.seed] enabled = false`.** There is no `seed.sql`, and pointing `sql_paths` at a
missing file makes `db reset` fail after the migrations succeeded — which reads like a
migration bug. The line stays commented in place so the next person sees where a seed goes.

**Signup off, password floor 12, both in `supabase/config.toml`.** The console is
invite-only, so an open signup form creates accounts the allowlist refuses. Both settings
live in the dashboard for the hosted projects and nothing in this repository can verify the
match — that mismatch is called out where the values are set.

The name that traps people is one section down: `[auth.email] enable_signup` is
`GOTRUE_EXTERNAL_EMAIL_ENABLED`, not "may people sign up with email". Turning it off to shut
signups also shuts password sign-in — GoTrue answers "Email logins are disabled" and the
console reads as a wrong password, with nothing in its own logs to say otherwise. It stays
`true`; `[auth] enable_signup = false` is the gate, and it was found the hard way against
the local stack before it was written down here.
