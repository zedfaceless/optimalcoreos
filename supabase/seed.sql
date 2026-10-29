-- Local fixtures.
--
-- `db reset` runs this after the migrations, so a fresh clone has a console somebody can
-- sign in to and leads worth looking at. It is a *fixture*, not a migration: nothing here
-- is data the product depends on, and production never sees this file.
--
-- Two accounts, both with the password `demo-local-1234`:
--
--   owner@demo.local   Ana Cruz    owner — sees Team and Audit
--   staff@demo.local   Jose Reyes  staff — leads and messages only
--
-- The rows in `auth.users` are written by hand because GoTrue has no SQL API for creating
-- a user with a password. The shape matters: `encrypted_password` is bcrypt (pgcrypto, in
-- `extensions`), and the matching `auth.identities` row is what the password grant looks
-- up — a user without one signs in and is told the password is wrong. Checked by signing
-- in against the local stack, which is the only way to know it is right.
--
-- No `admin_audit_log` rows: the audit page's empty state is honest for a database nobody
-- has clicked in yet, and seeding a fake history would teach a reader to distrust it.

begin;

-- --- the two admins ------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-00000000a001',
    'authenticated', 'authenticated', 'owner@demo.local',
    extensions.crypt('demo-local-1234', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Ana Cruz"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-00000000a002',
    'authenticated', 'authenticated', 'staff@demo.local',
    extensions.crypt('demo-local-1234', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Jose Reyes"}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values
  (
    '00000000-0000-4000-8000-00000000b001',
    '00000000-0000-4000-8000-00000000a001',
    '00000000-0000-4000-8000-00000000a001',
    '{"sub":"00000000-0000-4000-8000-00000000a001","email":"owner@demo.local","email_verified":true}',
    'email', null, now(), now()
  ),
  (
    '00000000-0000-4000-8000-00000000b002',
    '00000000-0000-4000-8000-00000000a002',
    '00000000-0000-4000-8000-00000000a002',
    '{"sub":"00000000-0000-4000-8000-00000000a002","email":"staff@demo.local","email_verified":true}',
    'email', null, now(), now()
  )
on conflict do nothing;

insert into public.admin_users (id, user_id, email, display_name, role, is_active) values
  (
    '00000000-0000-4000-8000-00000000c001',
    '00000000-0000-4000-8000-00000000a001',
    'owner@demo.local', 'Ana Cruz', 'owner', true
  ),
  (
    '00000000-0000-4000-8000-00000000c002',
    '00000000-0000-4000-8000-00000000a002',
    'staff@demo.local', 'Jose Reyes', 'staff', true
  )
on conflict (user_id) do nothing;

-- --- six leads, one per state the console renders ------------------------------------
--
-- `created_at` is relative (`now() - interval`) so the "3 days ago" column reads sensibly
-- whenever the reset happened, and `preferred_date` is relative to today so the dashboard's
-- meetings tile has something to count instead of being empty on every fresh clone. The
-- rest is fixed: one lead per status the pipeline strip draws, and internal notes on the
-- worked ones so the console has something to edit.

insert into public.quote_requests (
  id, created_at, full_name, business_name, email, phone, role, country,
  project_type, description, expected_users, timeline, budget,
  preferred_date, preferred_time, timezone, meeting_platform, consent,
  status, internal_notes, utm_source, utm_medium, referrer
) values
  (
    '00000000-0000-4000-8000-00000000d001', now() - interval '2 hours',
    'Rosa Lim', 'Lim Hardware', 'rosa@limhardware.ph', '+63 917 000 0001', 'Owner', 'PH',
    'Inventory / POS',
    'Stock is counted in a notebook every Sunday and the count is a day old by the time it reaches the counter. Two branches, one price list.',
    'Just me / small team (1–10)', 'As soon as possible', '₱50,000 – ₱150,000',
    current_date + 5, '09:00', 'Asia/Manila', 'google_meet', true,
    'new', null, 'google', 'cpc', 'https://www.google.com/'
  ),
  (
    '00000000-0000-4000-8000-00000000d002', now() - interval '1 day',
    'Marites Santos', 'Santos Bakeshop', 'marites@santosbakeshop.ph', null, 'Owner', 'PH',
    'Booking / order management',
    'Cake orders arrive on Facebook Messenger and get copied into a notebook. We lose one or two a month to a message nobody replied to.',
    'Just me / small team (1–10)', 'Within 1 month', 'Under ₱50,000',
    current_date + 9, '14:30', 'Asia/Manila', 'zoom', true,
    'contacted', 'Called Tuesday. Wants to see the order form before committing.',
    'facebook', 'social', null
  ),
  (
    '00000000-0000-4000-8000-00000000d003', now() - interval '3 days',
    'Dr. Anne Villar', 'Villar Dental Clinic', 'anne@villardental.ph', null, 'Practice manager', 'PH',
    'Custom business system',
    'Patient records are on paper and the dentist has to walk to the front desk to know what was done last visit.',
    '11–50', '1–3 months', '₱150,000 – ₱500,000',
    current_date + 12, '10:00', 'Asia/Manila', 'teams', true,
    'quoted', 'Sent the scope and the first quote on Thursday. Waiting on their lawyer.',
    'referral', 'referral', null
  ),
  (
    '00000000-0000-4000-8000-00000000d004', now() - interval '8 days',
    'Ben Ocampo', 'Ocampo Freight', 'ben@ocampofreight.ph', '+63 918 000 0004', 'Operations', 'PH',
    'Reporting & dashboards',
    'Every trip is logged in Excel by three people and the numbers never match at month end.',
    '11–50', '3+ months', '₱500,000+',
    current_date + 20, '15:00', 'Asia/Manila', 'google_meet', true,
    'won', 'Signed. Kickoff is the first week of next month.',
    'google', 'cpc', 'https://www.google.com/'
  ),
  (
    '00000000-0000-4000-8000-00000000d005', now() - interval '11 days',
    'Grace Uy', 'Uy Agri Supply', 'grace@uyagri.ph', null, 'Owner', 'PH',
    'Business website',
    'We have a Facebook page and nothing else. Buyers from outside the province ask for a website before they will place an order.',
    'Just me / small team (1–10)', 'Flexible', 'Not sure yet',
    current_date + 27, '11:00', 'Asia/Manila', 'any', true,
    'lost', 'Went with a cheaper template site. Worth a call in six months.',
    null, null, null
  ),
  (
    '00000000-0000-4000-8000-00000000d006', now() - interval '16 days',
    'Paolo Reyes', 'Reyes Salon Group', 'paolo@reyessalon.ph', null, 'Owner', 'PH',
    'Custom business system',
    'Four branches, one appointment book per branch, and a stylist who cannot see whether another branch has a free slot.',
    '11–50', '1–3 months', '₱150,000 – ₱500,000',
    current_date + 33, '13:00', 'Asia/Manila', 'zoom', true,
    'new', null, 'google', 'organic', null
  )
on conflict (id) do nothing;

-- --- three messages ----------------------------------------------------------------
insert into public.contact_messages (
  id, created_at, name, email, message, status, internal_notes, referrer
) values
  (
    '00000000-0000-4000-8000-00000000e001', now() - interval '5 hours',
    'Carlo Mendoza', 'carlo@mendozatrading.ph',
    'Do you work with businesses outside Luzon? We run a trading company in Cebu and the stock is counted by hand.',
    'new', null, null
  ),
  (
    '00000000-0000-4000-8000-00000000e002', now() - interval '2 days',
    'Liza Fernandez', 'liza@fernandezpharmacy.ph',
    'Asking about the 15 business days you mention on the how we work page. Is that for a whole system or the first version?',
    'replied', 'Answered: first version, then fortnightly releases. Sent the process page.',
    'https://www.google.com/'
  ),
  (
    '00000000-0000-4000-8000-00000000e003', now() - interval '9 days',
    'Nestor Cruz', 'nestor@example.ph',
    'Please visit our website for the best prices on industrial parts.',
    'spam', null, null
  )
on conflict (id) do nothing;

commit;
