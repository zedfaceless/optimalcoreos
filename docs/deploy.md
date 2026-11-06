# Deploy

The path from this repository to a URL a customer can use: one Supabase project, one
Vercel project, and the CLI commands in between. Nothing here is automated by CI, because
every step needs an account — so this file is the procedure, written to be run top to
bottom once, with the reasons inline where a step is easy to get wrong.

The two dashboards decide things this repository cannot: which project exists, and what
the hosted Auth settings are. Everything that *can* live in the repository already does —
schema in `supabase/migrations/`, Auth settings and email templates in
`supabase/config.toml` and `supabase/templates/`, every variable in `.env.example`.

## 0. Prerequisites

| Thing | Why |
| --- | --- |
| A domain you control | `NEXT_PUBLIC_SITE_URL` is a canonical origin. Everything else (sitemap, robots, Open Graph, links inside emails) is derived from it. |
| Supabase CLI ≥ 2.x | `supabase link`, `db push`, `config push`, `projects api-keys`. |
| Vercel account | Holds the build, the environment variables and the domain. |
| Resend account with a **verified domain** | Lead notifications, and the Auth SMTP in step 4. Without a verified domain, mail only goes to the account owner. |

```bash
supabase --version
node --version        # must match .nvmrc
pnpm --version        # must match packageManager in package.json (12.8.1)
```

## 1. The Supabase project

Region matters more than anything else on this page for how the console *feels*: every
`/devside` page load is several round trips to Postgres, so pick the region nearest the
people using it. `sin1` (Singapore) for a Philippines-based operation.

From the dashboard: **New project** → name, database password, region `sin1`. Or from the
CLI, if you prefer to keep it in one place (flag names as of CLI 2.x; `supabase projects
create --help` if a version disagrees):

```bash
supabase login
supabase projects create optimal-core-os --org-id <org-id> --region sin1 --db-password '<strong-password>'
supabase projects list                          # the <ref> is the leftmost column
```

Then link this checkout to it — one project per checkout, remembered in `supabase/.temp/`
(which is gitignored, so a colleague links their own):

```bash
supabase link --project-ref <ref>
```

And take the two keys out of the CLI rather than the dashboard, so there is no chance of
copying the wrong one:

```bash
supabase projects api-keys --project-ref <ref>
```

- `anon` / `publishable` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Public by design; it is in the
  browser bundle and RLS is what protects the data.
- `service_role` / `secret` → `SUPABASE_SERVICE_ROLE_KEY`. **Server only.** It bypasses
  every RLS policy, and this app's schema has no policies at all, so this key is the only
  way into the data. Never `NEXT_PUBLIC_`, never in a client component.
- The project URL is `https://<ref>.supabase.co` → `NEXT_PUBLIC_SUPABASE_URL`.

## 2. The schema

```bash
supabase db push --dry-run --linked   # read what would run, first
supabase db push                      # applies supabase/migrations/*.sql in timestamp order
```

Two things worth knowing before you run it:

- **The seed does not run.** `[db.seed] enabled = true` in `supabase/config.toml` applies to
  `supabase db reset`, which is a local command. `db push` sends migrations only. So the
  hosted database starts empty: no demo accounts, no demo leads. That is the intent — those
  demo rows exist so a fresh clone has a console worth signing in to, and shipping them
  would put `owner@demo.local` with a known password on the public internet.
- **Never edit an applied migration.** `supabase migration new <name>` for anything new;
  a migration the hosted database has already recorded cannot be changed, only followed.

Verify in the dashboard's Table Editor: `quote_requests`, `contact_messages`, `admin_users`,
`admin_audit_log`. Each should show RLS enabled with **no policies** — that is the design
(`README.md`, "Migrations"), and the reason the service key stays on the server.

## 3. Auth parity — the hosted project must reject what the local one rejects

`supabase/config.toml` sets a password floor and closes signup. A hosted project that keeps
the defaults accepts both of the things that file forbids, and no amount of code in this
repository can change that: these are GoTrue settings, living in the hosted project.

Either mechanism reaches the same place. The CLI is less typing; the dashboard is easier to
look at afterwards.

**With the CLI**, `supabase config push` uploads the local `[auth]` section:

```bash
supabase config push --help     # flags vary by CLI version; check before trusting the syntax
supabase config push
```

> This is a whole-section push, so it also sends `[auth] site_url` and the redirect
> allowlist, which locally name `127.0.0.1` / `localhost`. Set the URL configuration below
> immediately **after** this command, never before, or the push will overwrite it.

**With the dashboard**, two settings, matching what `pnpm check:config` asserts locally:

1. **Authentication → Sign In / Providers → Email** — turn **off** "Allow new users to sign
   up".
   Disable the *signup toggle*, not the Email *provider*. The provider is
   `GOTRUE_EXTERNAL_EMAIL_ENABLED`; with that off, GoTrue answers every password grant with
   "Email logins are disabled" and nobody — including the owner — can reach `/devside`.
2. **Authentication → Settings → minimum password length: 12.**

**Templates.** `supabase/templates/` holds the four branded emails (invite, recovery,
confirmation, magic link). Paste them into **Authentication → Email Templates** for the
matching type. The repository is the source of the copy; the dashboard is where it applies.
The invite link, in particular, lands on `/devside/auth/confirm?token_hash=…`, so the
template and `app/devside/auth/confirm` have to stay in step — they were checked together
against a real mailbox on the local stack.

**URL configuration.** **Authentication → URL Configuration**:

- **Site URL**: `https://<domain>` — no trailing slash, no path. Every link in every Auth
  email is built from this, which is why a `127.0.0.1` left here produces invitations that
  open a page only you can see.
- **Redirect URLs**: `https://<domain>/**`, plus `https://<preview-domain>/**` if previews
  should be able to complete a sign-in, and `http://localhost:3000/**` for local work. A
  redirect that is not on this list is refused — which is the feature, and also the reason
  a working local flow can fail in production with "requested path is invalid".

## 4. SMTP — the built-in mailer cannot run this

Supabase provides a default SMTP service, and it exists for exactly one purpose: letting
you render and test templates before you have a mail provider. Its own docs are blunt about
the limits — messages go **only to addresses on the project's team**, the rate limit is
**2 messages per hour** and can change without notice, and there is **no SLA**.

For this project that breaks the console: invites and recovery mails to real staff never
arrive, and the Auth log answers "Email address not authorized". So custom SMTP is a
deploy step, not an improvement.

With Resend, whose API key the app already uses for lead notifications (values below are
the ones Resend documents for its SMTP service):

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` (implicit TLS) or `587` (STARTTLS) |
| Username | `resend` |
| Password | a Resend **API key** — the same `RESEND_API_KEY` works |
| Sender email | an address on the domain verified in Resend — the same value as `EMAIL_FROM` |

**Authentication → Settings → SMTP Settings** → enable custom SMTP, paste, save. Then prove
it: **Authentication → Users** → your own row → *Send recovery*, and watch it arrive from
the domain rather than from Supabase. Lead notifications do not depend on this step; those
go out over the Resend API with the key in the environment.

## 5. Vercel

**Import** the Git repository. Vercel detects Next.js; leave build, install and output
commands at their defaults (`pnpm` is picked up from `packageManager` in `package.json`).
Set **Node.js Version** under Project Settings to whatever `.nvmrc` says, so the build
matches CI rather than whatever Vercel defaults to that month.

**The production branch — the one setting that decides Production or Preview.** Vercel labels
exactly one branch per project *Production*. Everything else is a *Preview* deployment, feature
branches and release branches alike, and a feature branch can never be anything else. The
default is `main`; this repository's merges land on `release/YYYY-MM-DD`, so a project left at
the default deploys nothing to the domain — every row in the Deployments tab reads **Preview**,
the site only answers on a `*-git-*.vercel.app` link that changes with every push, and nothing
is broken. It is one switch pointing at the wrong branch.

Pick one and write down which:

- **Ship from the release branch.** Settings → Git → **Production Branch** → the branch you
  actually merge into (`release/2026-10-29` today). The next push or merge to it cuts a
  Production deployment and the domain follows. The cost is one dashboard change each time a
  release branch is cut, and forgetting it looks exactly like this problem again.
- **Keep `main` as Production** — the conventional shape, and what `.github/workflows/ci.yml`
  and `preview.yml` are written around — and merge the release branch into `main` when you
  ship. Nothing to configure, but the site then updates on a release merge rather than when
  the release branch moves.

Two things follow. **Domains attach only to Production**: Settings → Domains lists the
environment a domain belongs to, and no preview URL will ever answer on the real domain however
healthy its build. And **the switch is not retroactive** — deployments already made keep their
label, so after changing it press *Redeploy* on one (Deployments → ⋯ → Redeploy) or push a
commit before concluding anything. From the CLI the same rule has another face: `vercel deploy`
is a Preview, and only `--prod` — as in `vercel build --prod` then `deploy --prebuilt --prod`,
which is what `.github/workflows/deploy.yml` runs — creates a Production deployment. `vercel ls`
prints the environment of each row.

There is no `vercel.json` and there should not be: the framework preset already knows how
to build this, a hand-written config is one more thing that can disagree with it, and none of
the settings above can live in a file anyway — the production branch is project state, not
repository state.

Environment variables — set for **Production** and **Preview**. Only the first one differs
between them:

| Variable | Required | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | **yes** | Production: `https://<domain>`, no trailing slash. Preview: the project's production URL, or the preview links to `localhost:3000`. |
| `NEXT_PUBLIC_SUPABASE_URL` | **yes** | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **yes** | anon key — inlined into the browser bundle at build |
| `SUPABASE_SERVICE_ROLE_KEY` | **yes** | service key. Mark it *Sensitive* in Vercel: write-only, unreadable after saving, which is what a key that bypasses RLS deserves |
| `IP_HASH_SALT` | **before real traffic** | `openssl rand -base64 32` |
| `RESEND_API_KEY` | for notifications | Resend key |
| `EMAIL_FROM` | recommended | `Optimal Core OS <hello@<domain>>` — must be the verified domain, or mail only reaches the account owner |
| `OWNER_NOTIFY_EMAIL` | recommended | inbox, or several comma-separated |
| `CONTACT_PUBLIC_EMAIL` / `_PHONE` / `_HOURS` | as supplied | printed on the site and in emails; empty renders no line rather than a fake one |
| `DATA_RETENTION_MONTHS` | optional | `24` if unset; quoted on `/privacy` |
| `NEXT_PUBLIC_LEGAL_UPDATED` | when counsel has read the pages | ISO date |
| `NEXT_PUBLIC_VERCEL_ANALYTICS` | optional | empty keeps Analytics and Speed Insights mounted; `off` unmounts them |

`NEXT_PUBLIC_*` values are compiled into the bundle, so changing one needs a **redeploy**.
The server-only ones are read per request and need nothing but a save.

**The domain**, then the canonical origin: Project → Settings → Domains → add it and follow
the DNS instruction. Then set `NEXT_PUBLIC_SITE_URL` to that exact origin and redeploy —
until you do, `sitemap.xml`, `robots.txt` and every canonical link keep naming the old
origin, because the value was baked in at build time.

**Delete the other deploy path.** Since Vercel builds from Git, `.github/workflows/deploy.yml`
is a second way to reach the same production deployment:

```bash
git rm .github/workflows/deploy.yml
```

Until it is deleted it stays harmless — it notices "Deploy skipped" rather than failing,
for as long as the three `VERCEL_*` secrets do not exist. Adding those secrets is the
opposite decision: it makes Actions ship the artefact CI built and tested, and then this
section's Git integration should be switched off instead.

It also triggers on `main` alone, which is the other reason the two decisions cannot be mixed:
with the production branch set to `release/**` above, adding those three secrets would build
`main` and push it with `--prod`, publishing code that is not the release to the domain that
serves the release. Delete-or-commit, never both.

`.github/workflows/preview.yml` has the same ending, one step later and for a different
reason: it exists because there was no host. Once Vercel serves production, the preview run
is a minute of runner time per push buying screenshots of a site that is already deployed and
photographable. Delete it after the first successful production deploy — not before, because
until then it is the only way to see the UI.

Two things about previews that surprise people:

- **Preview deployments share the database.** A quote submitted from a preview link is a
  real row and a real email to `OWNER_NOTIFY_EMAIL`. If that is not wanted, give Preview its
  own Supabase project (or a Supabase preview branch, which is a paid feature) rather than
  a second set of code.
- **Preview URLs sit behind Vercel Authentication** for team projects. A link sent to
  someone outside the team will ask them to log in to Vercel. Change that under Settings →
  Deployment Protection if a preview is meant to be openable by anyone.

## 6. The first admin

Signup is closed, so the owner cannot register — which is the point, and it means this one
row is created deliberately:

1. **Authentication → Users → Add user**: email and password, and tick auto-confirm.
   The password has to clear the 12-character floor set in step 3. Copy the user's UUID.
2. In the **SQL editor**:

```sql
insert into public.admin_users (user_id, email, display_name, role)
values ('<uuid from the dashboard>', 'you@example.com', 'Your Name', 'owner');
```

3. Sign in at `/devside`.

`admin_users` *is* the allowlist: `requireAdmin()` re-reads it on every request, so a user
with no row here — or with `is_active = false` — is refused no matter how valid their
session is. Everybody after the first is invited from **`/devside/team`**, which sends
Supabase's invitation email and writes the row itself.

## 7. Verify the deploy

Side-effect-free, and each line corresponds to a failure this project has actually had.
Needs only `curl`, so it can be run from anywhere.

```bash
BASE=https://<domain>

# The pages answer with pages, not empty 200s.
for p in / /contact /request-quote /solutions /devside; do
  printf '%-16s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")"
done

# The console is not indexable — this is a header, not a robots.txt line.
curl -sI "$BASE/devside" | grep -i '^x-robots-tag'      # expect: noindex, nofollow, noarchive

# The canonical origin is the real one.
curl -s "$BASE/sitemap.xml" | grep -c 'http://localhost:3000'   # expect: 0
curl -s "$BASE/sitemap.xml" | head -5

# The forms are wired: an empty body is refused by validation, which means the route and
# the Supabase client both work. A 503 here is a missing key; a 500 is a missing table.
curl -s -X POST "$BASE/api/contact" -H 'content-type: application/json' -d '{}'; echo
```

Then one real submission, from the site, with your own address: the row appears in
`contact_messages`, and the notification arrives from the address in `EMAIL_FROM`. That is
the only check that covers the whole chain — validation, throttle, IP hash, insert, Resend.

## 8. When it is not working

| Symptom | Cause |
| --- | --- |
| Every deployment is a **Preview**, the domain serves nothing, and the builds are green | The Production Branch is still `main` while merges land on `release/**`. Nothing is failing; §5, "The production branch". |
| The production branch was changed but the domain still serves the old build | The switch is not retroactive — redeploy once (Deployments → ⋯ → Redeploy), §5. |
| `sitemap.xml` names `http://localhost:3000` | `NEXT_PUBLIC_SITE_URL` missing in Vercel, or set *after* the build. It is inlined — redeploy. |
| Forms answer 503 with an email address to use instead | `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing. This is the designed response to an unconfigured deploy, not a crash. |
| Forms answer 500, log says `relation "public.contact_messages" does not exist` | Step 2 never ran: `supabase db push`. |
| `/devside` says it is not configured | `NEXT_PUBLIC_SUPABASE_*` missing, or the anon key is not the project's. |
| "Invalid login credentials" for a password you just set | No `admin_users` row, or `is_active = false`. The Auth user is not enough on its own. |
| "Email logins are disabled" | The Email **provider** was switched off instead of the signup toggle (step 3). |
| An invitation never arrives | Built-in SMTP: 2 messages per hour, team addresses only, error "Email address not authorized". Step 4. |
| An invitation arrives and its link opens `localhost` | The hosted Site URL is still `127.0.0.1` — usually `config push` overwriting it (step 3). |
| A lead is saved but nobody is emailed | `RESEND_API_KEY`, `EMAIL_FROM` or `OWNER_NOTIFY_EMAIL`; or `EMAIL_FROM` is not on the verified domain. The server log says `[email] skipped`. |
| Preview URL asks for a Vercel login | Deployment Protection. Step 5. |

## 9. What deploy does not settle

Deployment makes the site real; it does not supply the facts only the owner has. Those are
`docs/PLACEHOLDERS.md` — the confirmed public address, phone, hours, the legal review date,
and the retention decision. Two are worth repeating because they touch production data:

- **`IP_HASH_SALT`** must be set before the first real submission. Without it the stored
  column is an unsalted SHA-256 of an IP address, which is reversible over the IPv4 space in
  minutes. Rotating it later is cheap; the hashes it protected stop matching, which is what
  a rotation means.
- **The audit trail keeps everything, forever.** `admin_audit_log` grants `select` and
  `insert` and no `delete` to anyone, deliberately, and nothing prunes it. The retention
  sentence on `/privacy` is about lead data and does not mention operational logs. Either
  that sentence grows or the purge grows a table; it is a policy decision, not a bug.

Key rotation and removing a person are in `README.md`, "Rotating keys".

