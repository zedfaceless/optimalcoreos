-- `updated_at` is maintained by the database, not by the callers, so a row edited
-- from the console cannot forget it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists quote_requests_set_updated_at on public.quote_requests;
create trigger quote_requests_set_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;

-- No `create policy` for these two tables is deliberate: RLS with no policy denies
-- every row to every non-service role, which is exactly the intent. If a policy is
-- ever added for `anon`, the forms stop being the only way in.
revoke all on public.quote_requests from anon, authenticated;
revoke all on public.contact_messages from anon, authenticated;

comment on table public.quote_requests is
  'Quote wizard submissions. Written by POST /api/quote with the service key; read in /devside.';
comment on table public.contact_messages is
  'Contact form submissions. Written by POST /api/contact with the service key; read in /devside.';
comment on column public.quote_requests.preferred_time is
  'Wall-clock time the visitor chose, in Asia/Manila. `timezone` is the zone its label was shown in.';
