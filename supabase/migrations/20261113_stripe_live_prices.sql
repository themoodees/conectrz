-- Switch the paid plans to the live-mode Stripe prices (USD, monthly).
-- Apply together with the live STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET change.
update public.subscription_tiers set stripe_price_id = 'price_1UXMokK0324rxOr5VnPhvi4Y' where name = 'Pro';
update public.subscription_tiers set stripe_price_id = 'price_1UXMpEK0324rxOr5R4NdwJ28' where name = 'Business';
