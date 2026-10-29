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

## Identity and the trail

**The audit log is one append-only table, and it is append-only by privilege.** §13 sketches
a history per entity. `admin_audit_log` is one table with `action`, `entity`, `entity_id` and
a small `detail` object instead, because five near-identical history tables would each need
their own reader and their own test. `service_role` holds `select` and `insert` and nothing
else, so the console cannot rewrite the trail even through a bug; there is no `updated_at`
for the same reason. `entity_id` is not a foreign key: two of the three entities are rows a
retention purge will delete, and an audit row should outlive its subject. `actor_email` is a
copy rather than a join for the same reason — a departed admin's actions still read as theirs.

**A recovery link lands on a route handler, not a page.** Turning a token into a session
writes cookies, and a Server Component cannot; a page would have had to render first and then
redirect, which leaves a half-authenticated render behind. `/devside/auth/confirm` accepts
either shape Auth sends — a `token_hash` with a `type`, which is what our own templates link
to, and a PKCE `code`, which is what the default flow redirects with — and forwards to
`/devside/update-password`. The page then tells three states apart: no session (spent or
expired link), a session for an account that is not on the allowlist, and a session that may
set a password. Only the third renders a form.

**The team page refuses two things, and one of them is the point.** Nobody changes their own
access, and the last active owner cannot be deactivated. The second is mostly a backstop: the
only row that can be the last owner is the actor's own, so `self` fires first in practice. It
stays because the guard costs one comparison and it is what a future non-human caller would
need — and `docs/PLACEHOLDERS.md` says so rather than implying both refuse real clicks.

**`pnpm check:config` asserts what the repository can see.** The password floor and the
signup switch live in the dashboard on hosted projects, so no local check can prove they
match; the script asserts `supabase/config.toml` (floor 12, signups shut, the email provider
still on, the redirect target listed, all four template files present) and prints the hosted
list beside the result. It is deliberately a small line-based reader rather than a TOML
parser — it reads only the keys it asserts, and it says so at the top.

**Analytics default on.** `NEXT_PUBLIC_VERCEL_ANALYTICS` unmounts `<Analytics />` and
`<SpeedInsights />` when it says `off`, `false`, `0` or `no`. Both packages are cookieless and
inert off Vercel, so the wrong default is the one where a typo silently turns telemetry off.

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

**`[db.seed]` is on, and the seed writes real Auth rows.** Two admins, six leads and three
messages make a fresh `db reset` a console somebody can sign in to and use, which is what a
reviewer needs and what the fixtures in a screenshot are. The `auth.users` rows carry a
bcrypt password and the matching `auth.identities` row because the password grant looks up
the identity, not the user — a seed that inserts only `auth.users` produces an account whose
correct password is refused. Verified by signing in, not by the reset's exit code.

**Signup off, password floor 12, both in `supabase/config.toml`.** The console is
invite-only, so an open signup form creates accounts the allowlist refuses. Both settings
live in the dashboard for the hosted projects and nothing in this repository can verify the
match — `pnpm check:config` asserts the local file and prints the hosted list beside the
result, which turns a mismatch from something a reviewer remembers into something a run
names.

The name that traps people is one section down: `[auth.email] enable_signup` is
`GOTRUE_EXTERNAL_EMAIL_ENABLED`, not "may people sign up with email". Turning it off to shut
signups also shuts password sign-in — GoTrue answers "Email logins are disabled" and the
console reads as a wrong password, with nothing in its own logs to say otherwise. It stays
`true`; `[auth] enable_signup = false` is the gate, and it was found the hard way against
the local stack before it was written down here.

## Delivery

**CI runs the README's own commands, in its order, and holds no secrets.**
`.github/workflows/ci.yml` is `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`
on every pull request into `main` and every push to it. Nothing in it needs a key, because
every variable in `.env.example` is optional by design: an empty environment is a state the
site is supposed to survive, and CI is the cheapest place to keep proving that.

The alternative — a matrix of Node versions, or a job per check so they fail faster — was
rejected as cost without an answer: there is one runtime (`.nvmrc`), one package manager
version (`packageManager`), and `pnpm check` takes seconds, so a second job would mostly buy
a second checkout. `pnpm build` does come after `pnpm check` rather than beside it, so a lint
failure answers before a compile starts. The action tags are major-version pins (`@v4`); a
commit SHA per action is stricter and is what a hardened repository does, but it makes an
audit read as a hex string, and this repository has no precedent for either.

**An empty `NEXT_PUBLIC_SITE_URL` means unset, and that is a fix rather than a doc.** The
reader used `??`, which only catches "absent", so the empty string — what `.env.example`
ships, and what a GitHub Actions variable defined to nothing hands a build — reached
`new URL("")` in `app/layout.tsx` and failed `next build` with `Invalid URL`. A fresh
checkout that copied `.env.example` could not build, which contradicts the promise that file
makes in its own header. `resolveSiteUrl()` now treats blank as absent and trims
surrounding whitespace, and `lib/site/config.test.ts` pins it.

The alternative — telling people to delete the key instead of leaving it empty — was
rejected because the file's whole design says a blank key is a feature that stays off. What
would change the answer is a variable whose absence is not the same as its emptiness; none
of the ones this app reads is like that.

**While there is no host, Actions publishes a preview and calls it one.** A GitHub-hosted
runner is ephemeral and accepts no inbound connection, so "deploy to Actions" cannot mean
what a host means. `.github/workflows/preview.yml` therefore builds the production bundle,
serves it on port 3000, walks every published route, asserts the home page is a page rather
than an empty 200, photographs desktop and phone widths with the Chrome already on the runner
image, and files those as an artefact; dispatched by hand it also opens an anonymous
Cloudflare quick tunnel and holds the job open for twenty minutes, which is the only way this
shape of runner can hand anybody a URL. `NEXT_PUBLIC_SITE_URL` falls back to localhost here,
so canonical links and the sitemap point at the preview and not at a domain that does not
serve it yet, and the preview holds no Supabase keys — the pages render, the submissions
cannot, and the step summary says so instead of letting a visitor discover it.

The alternatives were rejected for concrete reasons. A self-hosted runner on somebody's
machine would serve the site properly, at the cost of a service to keep awake and patched for
a look at a page. Vercel is a host, and choosing a host is the decision this one postpones.
A static export would have required deleting the server actions and the `next/og` routes to
satisfy `output: 'export'`, which previews a different site, not this one. The tunnel is
temporary in the way the file itself says: random URL, public to anyone holding it, gone when
the run ends or is cancelled. When a real host exists, delete the file; nothing else reads it.
