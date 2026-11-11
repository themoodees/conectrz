-- Record of who ticked "send me news and tips" at sign-up, when, and which Resend list they were put in.
-- Written only by the marketing-contact edge function (service role); RLS on with no policies.
create table public.marketing_consents (
  user_id uuid primary key references auth.users (id) on delete cascade,
  opted_in_at timestamptz not null default now(),
  list text not null,
  source text not null default 'signup_checkbox'
);
alter table public.marketing_consents enable row level security;
