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
- **There is no `/devside/reset-password`.** §14.5 names the route and a middleware that
  would exempt it. Nothing here links to it, and it is absent from
  `supabase/config.toml`'s `additional_redirect_urls`, because a redirect target that 404s is
  worse than none. A locked-out admin is reset from the Supabase dashboard today; the
  in-app flow needs a recovery template and a token exchange in `/devside`.
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
- **The schema is three tables, not §13.** `quote_requests`, `contact_messages` and
  `admin_users` are what the public forms write and what the console reads. Projects,
  quotations, milestones, activities, attachments and the audit log are not built; the
  console's status, notes and filters are columns on the two lead tables. When those tables
  arrive, the console grows a page per table rather than a rewrite.
- **`supabase/seed.sql` does not exist**, so `[db.seed]` is disabled in
  `supabase/config.toml` rather than pointed at a missing file. Local data is whatever the
  forms insert.
- **Adding an admin is a SQL insert.** Create the account in Studio (`enable_signup = false`
  is deliberate), then insert the matching `public.admin_users` row with the same
  `user_id`. There is no invite flow in the console yet; the allowlist row is the gate, and
  `admin_users_user_id_fkey` refuses a row for an account that does not exist.
- **Min-fill-time, disposable domains and link-count flagging are not implemented.** §15.5
  lists a 3-second floor on `form_started_at`, a small blocklist and a "more than three URLs
  in the description" flag. None of the three is built; the honeypot is, and it cannot be
  faked by a visitor because a person never sees the field. The others need a client-side
  timestamp (which a bot can lie about) and a list nobody has supplied yet.
- **A bot gets no reference to be fooled by.** §15.4 describes a fake reference on the
  honeypot path; the success answer here is `{ ok: true }` with no reference at all, and the
  wizard's success screen shows copy rather than a ticket number, so a bot sees exactly what
  a person sees and there is no second shape to keep in step.
- **Email templates are plain HTML** in `lib/email/templates.ts`. The four branded Supabase
  Auth emails the PRD describes are not in `supabase/templates/`, so the hosted projects
  still send the stock invitations and recovery mails.
