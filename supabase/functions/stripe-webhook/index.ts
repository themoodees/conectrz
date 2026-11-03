// Supabase Edge Function: receives Stripe webhooks and keeps `subscriptions` in sync.
//
// Stripe events to send here (Stripe → Developers → Webhooks):
//   customer.subscription.created
//   customer.subscription.updated
//   customer.subscription.deleted
//
// Secrets (Supabase → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY      — sk_test_… (sandbox) or sk_live_…
//   STRIPE_WEBHOOK_SECRET  — whsec_… of this webhook endpoint
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
//
// Deploy WITHOUT JWT verification (Stripe has no Supabase token; the Stripe
// signature is what protects this endpoint):
//   supabase functions deploy stripe-webhook --no-verify-jwt

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@23";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const FREE_PLAN_YEARS = 100; // same as the default subscription created at sign-up

const toIso = (unixSeconds: number) => new Date(unixSeconds * 1000).toISOString();
const text = (body: string, status = 200) => new Response(body, { status });

/** Mirrors one Stripe subscription into our `subscriptions` table. */
async function syncSubscription(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const priceId = item?.price.id;

  // 1) Which company? Set in metadata at checkout; fall back to the saved customer.
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  let companyId: string | undefined = sub.metadata?.company_id;
  if (!companyId) {
    const { data } = await supabase
      .from("billing_customers")
      .select("company_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    companyId = data?.company_id;
  }
  if (!companyId) {
    console.error("No company for subscription", sub.id);
    return;
  }
  await supabase
    .from("billing_customers")
    .upsert({ company_id: companyId, stripe_customer_id: customerId }, { onConflict: "company_id" });

  // 2) Which plan?
  const { data: tier } = await supabase
    .from("subscription_tiers")
    .select("id")
    .eq("stripe_price_id", priceId ?? "")
    .maybeSingle();
  if (!tier) {
    console.error("No plan for Stripe price", priceId, "subscription", sub.id);
    return;
  }

  // 3) Status. Payment still being set up: nothing to grant yet.
  if (sub.status === "incomplete") return;
  const ended = ["canceled", "unpaid", "incomplete_expired"].includes(sub.status);
  // A subscription cancelled "at period end" keeps working until that date.
  const status = ended ? "expired" : sub.cancel_at_period_end ? "canceled" : "active";

  // Newer Stripe API versions keep the billing period on the item.
  const start = item?.current_period_start ?? (sub as any).current_period_start;
  const end = item?.current_period_end ?? (sub as any).current_period_end;
  const periodStart = toIso(start);
  const periodEnd = ended ? new Date().toISOString() : toIso(end);

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("subscriptions")
      .update({
        tier_id: tier.id,
        status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
      })
      .eq("id", existing.id);
  } else {
    // A new paid subscription replaces whatever the company had (e.g. Free).
    await supabase
      .from("subscriptions")
      .update({ status: "canceled", current_period_end: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("status", "active");
    await supabase.from("subscriptions").insert({
      company_id: companyId,
      tier_id: tier.id,
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      stripe_subscription_id: sub.id,
    });
  }

  // 4) Once a paid plan has ended, the company goes back to Free.
  if (ended && existing?.status !== "expired") {
    const { data: free } = await supabase
      .from("subscription_tiers")
      .select("id")
      .eq("name", "Free")
      .maybeSingle();
    if (free) {
      const now = new Date();
      const later = new Date(now);
      later.setFullYear(later.getFullYear() + FREE_PLAN_YEARS);
      await supabase.from("subscriptions").insert({
        company_id: companyId,
        tier_id: free.id,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: later.toISOString(),
      });
    }
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return text("Method not allowed", 405);

  const signature = req.headers.get("stripe-signature");
  if (!signature) return text("Missing signature", 400);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider,
    );
  } catch (error) {
    console.error("Bad signature", error);
    return text("Invalid signature", 400);
  }

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await syncSubscription(event.data.object as Stripe.Subscription);
    }
  } catch (error) {
    console.error("Webhook handler failed", event.type, error);
    return text("Handler error", 500); // Stripe retries
  }
  return text("ok");
});
