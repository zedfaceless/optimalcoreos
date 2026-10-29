# Placeholders

The PRD marks certain values `[PLACEHOLDER]` and forbids inventing them (§0.4). This file
is the list: what the code ships with today, what only the owner can supply, and where to
put it. Nothing here is a bug — an empty variable renders an honest absence rather than a
guess — but every row is something a launch needs.

Two rules this file exists to keep:

- No business fact (domain, phone, hours, retention period, SLA) is typed into a component.
  If it can change without a deploy it is read from the environment (`lib/site/settings.ts`,
  `lib/site/config.ts`, `content/legal.ts`); if it cannot, the file that holds it is named
  below so the next reader knows where the decision lives.
- A placeholder that is not supplied stays missing. A fake phone number or a stock photo of
  a "CEO" is worse than a blank line.

## Environment variables

`.env.example` carries every key with a comment. This table says what an empty one costs.

| Variable | Ships as | Empty means |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `sitemap.xml`, `robots.txt`, canonical links and email links all name localhost. The production build must set it. |
| `NEXT_PUBLIC_SUPABASE_URL` | unset | The forms answer 503 with an address to email instead; `/devside` shows "not configured". |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | unset | The console cannot sign in. |
| `SUPABASE_SERVICE_ROLE_KEY` | unset | Nothing can be written to the three tables. Server only — never `NEXT_PUBLIC_`. |
| `RESEND_API_KEY` | unset | Rows are still saved; nobody is emailed. The log says `[email] skipped`. |
| `EMAIL_FROM` | `Optimal Core OS <onboarding@resend.dev>` | The Resend test sender, which delivers only to the Resend account owner. Needs a verified domain before a real lead is answered. |
| `OWNER_NOTIFY_EMAIL` | unset | No new-lead notification. Comma-separated for more than one inbox. |
| `CONTACT_PUBLIC_EMAIL` | `hello@optimalcoreos.com` | — (a public address has to exist on the page; this is the one the site ships with and the owner should confirm it). |
| `CONTACT_PUBLIC_PHONE` | unset | No phone line is printed anywhere. Correct until a number exists. |
| `CONTACT_PUBLIC_HOURS` | `Monday to Friday, 09:00–17:00 (Asia/Manila)` | Unconfirmed opening hours would be published. |
| `IP_HASH_SALT` | empty string | The IP hash becomes a plain unsalted SHA-256 of an address — brute-forceable in minutes over the IPv4 space. Set it before the first real submission. |
| `DATA_RETENTION_MONTHS` | `24` | `/privacy` quotes 24 months. |
| `NEXT_PUBLIC_LEGAL_UPDATED` | unset | `/privacy` and `/terms` render no "last updated" date, which is the honest state until counsel has read them. |

## Decisions the owner has to make

| What | Where it lives now | What is needed |
| --- | --- | --- |
| SLA on quotation (§6, "within a few business days") | `content/process.ts`, step 2 | The copy already says "Within a few business days". If the CEO wants a number, it is a copy edit, not an env var. |
| Leadership block (§8) | `content/about.ts`, "Leadership" | A text paragraph and no portrait, exactly as the PRD instructs. Publishing a name, title, two-sentence bio and a real photo is an edit to that file. |
| FAQ: "Who owns the system?" (§8) | `content/faq.ts`, question 6 | Answer is "You do. Ownership terms are written in your agreement." Needs the CEO's confirmation of the IP terms. |
| Budget bands and currency (§10.3) | `content/quote.ts`, `BUDGET_RANGES` | Five PHP bands plus "Prefer to discuss" and "Not sure yet". These are the shipped defaults; the bands are the CEO's call and a change is a one-file edit — but a band already chosen by a stored lead keeps the string it was submitted with. |
| Meeting hours and slot length (§10.4) | `lib/site/settings.ts`, `meetingHours` | 09:00–17:00 Asia/Manila in 30-minute slots, hard-coded on purpose: the slot list is generated from it and a mismatch with the stored `preferred_time` would be invisible. Changing it is a code change plus a test update. |
| Sending domain (§12) | `EMAIL_FROM`, in the Resend dashboard | A subdomain such as `mail.optimalcoreos.com`, with SPF, DKIM and DMARC verified before launch. |
| Logo (§16) | `app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` | A drawn wordmark and a concentric-ring core glyph, generated with `next/og`, no raster asset. Replacing it means changing those three files, not dropping in a PNG. |
| Function region (§17) | the Vercel project | `sin1` (Singapore) is the recommendation for a Philippines-based operation; it is a dashboard setting, not repository configuration. |
| Legal review (§9) | `content/legal.ts` | `/privacy` and `/terms` are clearly written drafts, per the PRD. Counsel should read them before `NEXT_PUBLIC_LEGAL_UPDATED` is set. |


## Recorded gaps

Found while building this pass, written down rather than quietly patched. None of these
pretends to be finished.

- **Rate limiting is in-process.** `lib/api/guard.ts` keeps a `Map` per instance: 5 posts an
  hour per IP hash, 3 per email. §15.4 asks for a `rate_limits` table with an atomic upsert.
  On Vercel that map protects one warm function, so a determined script gets through. The
  durable fix is a table plus one SQL function; the counter that exists today stops a
  double-submit, which is what a person actually does.
- **`/devside/reset-password` exists, and the hosted projects still need two clicks.** The
  request form, the `token_hash` exchange in `/devside/auth/confirm` and the
  `/devside/update-password` form are built and were verified end to end on the local stack
  (request → mailbox → link → session → new password → sign-in, with a reused link refused).
  Two things live outside this repository: `http://…/devside/auth/confirm` has to be in each
  project's redirect allow-list, and the four templates in `supabase/templates/` have to be
  pasted into Authentication → Emails. The dashboard's copies win, and until they are pasted
  a hosted project sends GoTrue's stock mail pointing at GoTrue's own confirmation URL,
  which lands on a page that cannot set a session cookie.
- **`NEXT_PUBLIC_VERCEL_ANALYTICS` is not implemented.** §14.3 lists it as an optional
  toggle; `<Analytics />` and `<SpeedInsights />` are always mounted in `app/layout.tsx`.
  Both are cookieless and inert outside Vercel, which is why the missing switch is a gap and
  not a leak.
- **There is no `middleware.ts`.** §14.5 asks for one on `/devside/:path*`. The
  `X-Robots-Tag` and `Cache-Control` headers it would add are set in `next.config.ts`
  `headers()`, where they cannot be skipped by a matcher typo, and the session gate is
  `requireAdmin()` on every page and every action — the database call it needs cannot run at
  the edge anyway. What middleware would add is a faster redirect for an anonymous visitor,
  not a stronger one.
- **The schema is four tables, not §13.** `quote_requests`, `contact_messages`,
  `admin_users` and `admin_audit_log` are what the public forms write and what the console
  reads. Projects, quotations, milestones, activities and attachments are not built; the
  console's status, notes and filters are columns on the two lead tables, and the audit log
  is one append-only table rather than the per-entity history §13 sketches. When those
  tables arrive, the console grows a page per table rather than a rewrite.
- **`supabase/seed.sql` does not exist**, so `[db.seed]` is disabled in
  `supabase/config.toml` rather than pointed at a missing file. Local data is whatever the
  forms insert.
- **Adding an admin is a page, and one case is still a dashboard step.** `/devside/team`
  invites by address (Supabase's invite mail, then the `admin_users` row), promotes, demotes
  and deactivates. Two rules keep it from locking itself out: nobody changes their own access,
  and the last active owner cannot be deactivated — both in `lib/devside/team.ts` and both
  re-asked inside the action. The `last-owner` branch is a backstop rather than a path a
  person can reach: because `self` is refused first, the only row that could be the last owner
  is the actor's own. It stays because it is cheap and it is what a future non-human caller
  would need, but the guard a real owner meets is `self`.
  What is still manual: an address that already has a Supabase account but no allowlist row
  (a deactivated person re-invited, a hand-made Studio user). `inviteUserByEmail` refuses an
  existing account with "already registered" and this build has no lookup-by-address call, so
  the console says the invitation failed and the row is added by hand — the one step left for
  Studio.
- **The §15.5 bot signals are heuristics, and only one of them is a wall.** All three are
  built in `lib/validation/spam.ts` and asked once per submission by both route handlers:
  a three-second floor on `formStartedAt`, a sample blocklist of about seventy throwaway
  domains (matched on label boundaries, subdomains included), and a drop past three links in
  the free-text field. Each one answers a dropped submission with the same `{ ok: true }` a
  saved one gets, because a bot that can read which check fired can iterate against it.
  What is honestly weak: a script that omits `formStartedAt` skips the floor. That is
  deliberate — a missing timestamp is also what a visitor whose clock is wrong sends, and
  losing a hand-typed lead to a heuristic is the worse failure — so the floor only ends a
  submission the browser positively dated inside three seconds. The blocklist is a sample,
  not a subscription feed; the providers rotate, and the list wants replacing with a paid
  feed or a nightly pull when one exists.
- **A bot gets no reference to be fooled by.** §15.4 describes a fake reference on the
  honeypot path; the success answer here is `{ ok: true }` with no reference at all, and the
  wizard's success screen shows copy rather than a ticket number, so a bot sees exactly what
  a person sees and there is no second shape to keep in step.
- **The Auth emails are templates now, and the dashboard still decides.** `supabase/templates/`
  holds the four branded emails (invite, recovery, confirmation, magic link), wired in
  `supabase/config.toml`; the invite and recovery ones were checked against a real mailbox on
  the local stack, including the `token_hash` link into `/devside/auth/confirm`. The ones
  `lib/email/templates.ts` builds are a different set — the lead notifications sent by Resend
  — and both are plain HTML with inline styles, because a mail client is not a browser. The
  hosted projects keep their own copies in the dashboard, so the repository is the source of
  the copy, not the thing that applies it.

- **The audit trail has no retention rule.** `admin_audit_log` appends a row per change and
  nothing prunes it: the ledger grants `select` and `insert` to the service key and no
  `delete` to anybody. That is right for a trail — one that deletes itself is not one — but it
  does not match the retention sentence on `/privacy`, which is about lead data and does not
  mention operational logs. Either the policy grows that sentence or the purge grows a table;
  both are the owner's call, and until then the honest answer is that the trail keeps
  everything.

