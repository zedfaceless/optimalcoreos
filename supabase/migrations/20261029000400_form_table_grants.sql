-- The service key is the only reader of the two form tables, and locally it could not.
--
-- `20261029000200` revokes the grants from `anon` and `authenticated` but says nothing
-- about `service_role`, which is not the same thing everywhere: on a fresh `supabase start`
-- the CLI stack seeds only `Dxtm` — truncate, references, trigger, maintain — for the API
-- roles, so `service_role` held no `select` and no `insert` on either table. That left
-- `/api/quote` and `/api/contact` answering 503 with the insert denied, and `/devside`
-- showing an empty list: a failure that hides itself, because an empty console and a quiet
-- site look exactly like a console nobody has used.
-- `20261029000300_admin_users.sql` grants for its own table; these two are the ones it
-- left out, so the grant is spelled out here rather than inherited. Writing it down also
-- means the local stack and a hosted project behave the same way, whichever default
-- privileges `supabase_admin` happens to apply there.
--
-- `select` is the console (lists, detail, export, the dashboard counts), `insert` is the
-- two route handlers, `update` is the status and the notes a person sets in /devside. No
-- `delete`: a lead is the record that somebody asked us something, and the only thing that
-- should ever remove one is the retention purge, which runs as the project owner.

grant select, insert, update on public.quote_requests to service_role;
grant select, insert, update on public.contact_messages to service_role;
