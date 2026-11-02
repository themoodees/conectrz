-- Billing with Stripe.
-- 1) Each paid plan points at its Stripe price.
-- 2) Stripe customer ids live in their own table that only the server can write
--    (a company can read its own row, but never change it).
-- 3) One subscription row per Stripe subscription.

alter table public.subscription_tiers
  add column if not exists stripe_price_id text unique;

-- SANDBOX price ids. Replace with the live ids when going live (admin SQL or a new migration).
update public.subscription_tiers set stripe_price_id = 'price_1UXMokK0324rxOr5VnPhvi4Y' where name = 'Pro';
update public.subscription_tiers set stripe_price_id = 'price_1UXMpEK0324rxOr5R4NdwJ28' where name = 'Business';

create table if not exists public.billing_customers (
  company_id         uuid primary key references public.company_profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at         timestamptz not null default now()
);

alter table public.billing_customers enable row level security;

create policy "billing_customers select own"
  on public.billing_customers
  for select
  to authenticated
  using (company_id = (select auth.uid()) or (select public.is_admin()));

-- No insert/update/delete policies: only the webhook (service role) writes here.
revoke insert, update, delete on public.billing_customers from anon, authenticated;
revoke all on public.billing_customers from anon;

create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;
