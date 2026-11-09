-- Tracks who has already received the "complete your profile" reminder email, so nobody gets it twice.
-- Only the send-profile-reminder edge function (service role) reads or writes it.
create table public.profile_reminders (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kind text not null check (kind in ('hidden_profile', 'no_profile')),
  sent_at timestamptz not null default now()
);
alter table public.profile_reminders enable row level security;
-- No policies on purpose: only the service role can access this table.
