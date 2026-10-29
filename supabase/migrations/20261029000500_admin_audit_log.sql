-- The console's audit trail (PRD §13's "audit log", one table).
--
-- Three people share this console, and until now the only record of who moved a lead
-- from `new` to `won` was the row's `updated_at`: an answer to "when", never to "who".
-- That is the wrong shape for a sales pipeline somebody gets asked about.
--
-- Append-only by privilege rather than by trigger: `service_role` is granted `select`
-- and `insert` and nothing else, so the console can write history and cannot rewrite
-- it — including through a bug. There is no `updated_at` column for the same reason.
--
-- `detail` is `jsonb` because the interesting part differs per action: a status change
-- carries `{ from, to }`, an invite carries a role, a password change carries nothing.
-- The keys are described in `lib/devside/audit.ts`, which is the only reader that
-- interprets them.
--
-- `entity_id` is deliberately not a foreign key. Two of the three entities are rows a
-- retention purge will eventually delete, and an audit row that vanished with its
-- subject would defeat the point; the id is kept as evidence after the row is gone.
-- `actor_email` is a copy, not a join, for the same reason: a departed admin's actions
-- must still read as theirs after their `admin_users` row is deleted.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_email text not null check (char_length(actor_email) between 3 and 254),
  action text not null check (
    action in (
      'lead.update',
      'message.update',
      'admin.invite',
      'admin.activate',
      'admin.deactivate',
      'admin.role',
      'admin.password'
    )
  ),
  entity text not null check (entity in ('quote_request', 'contact_message', 'admin_user')),
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  constraint admin_audit_log_detail_is_object check (jsonb_typeof(detail) = 'object')
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_entity_idx
  on public.admin_audit_log (entity, entity_id, created_at desc);

alter table public.admin_audit_log enable row level security;

-- No policy deliberately: the table is read by `/devside/audit` and the lead page
-- through the service key, after `requireAdmin()` has answered. An anon or signed-in
-- browser asking for it directly is refused by RLS rather than by a route.
revoke all on public.admin_audit_log from anon, authenticated;
grant select, insert on public.admin_audit_log to service_role;

-- Who invited whom. The inviter is a copy of an address for the same reason as
-- `actor_email` above, and it is nullable because the seed and the hand-made first
-- admin predate any invite.
alter table public.admin_users add column if not exists invited_by text;
