"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { getStripe, isBillingConfigured } from "@/lib/stripe";
import { mockStore } from "@/mocks/store";

/*
 * Billing actions (company side). They talk to Stripe; our own `subscriptions`
 * table is updated when Stripe's webhook reaches the `stripe-webhook` function.
 *
 * Changing plans:
 *  - Free → paid:        Stripe checkout (the company enters a card).
 *  - paid → pricier:     switches immediately; the price difference is charged now.
 *  - paid → cheaper/Free: starts at the end of the paid period (nothing is lost).
 */

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const done = (path: string): never => {
  revalidatePath("/plans");
  revalidatePath("/settings");
  redirect(path);
};

/** Sends the company to Stripe's secure checkout for the chosen plan. */
export async function startCheckout(formData: FormData): Promise<void> {
  if (isMockMode || !isBillingConfigured) redirect("/plans");

  const planId = String(formData.get("planId") ?? "");
  const { supabase, user } = await requireSupabaseUser();

  const [{ data: tier }, { data: customer }] = await Promise.all([
    supabase
      .from("subscription_tiers")
      .select("stripe_price_id, monthly_price_usd_cents, is_active")
      .eq("id", planId)
      .maybeSingle(),
    supabase
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("company_id", user.id)
      .maybeSingle(),
  ]);
  if (!tier || !tier.is_active || !tier.stripe_price_id || tier.monthly_price_usd_cents <= 0) {
    redirect("/plans?billing=error");
  }

  const origin = await siteOrigin();
  let url: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: tier.stripe_price_id, quantity: 1 }],
      client_reference_id: user.id,
      // Lets the webhook know which company this subscription belongs to.
      subscription_data: { metadata: { company_id: user.id } },
      ...(customer
        ? { customer: customer.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      success_url: `${origin}/settings?billing=success`,
      cancel_url: `${origin}/plans`,
    });
    url = session.url;
  } catch (error) {
    console.error("Stripe checkout failed", error);
  }
  redirect(url ?? "/plans?billing=error");
}

/** Detaches a pending schedule (a planned downgrade) so the subscription can be edited. */
async function releaseSchedule(stripe: Stripe, sub: Stripe.Subscription) {
  const schedule = sub.schedule;
  if (!schedule) return;
  await stripe.subscriptionSchedules.release(typeof schedule === "string" ? schedule : schedule.id);
}

/**
 * Change to another plan, from the Plans page.
 * Free → paid goes through checkout; every other change edits the subscription in place.
 */
export async function changePlan(formData: FormData): Promise<void> {
  const planId = String(formData.get("planId") ?? "");

  if (isMockMode) {
    const plan = mockStore.plans.find((p) => p.id === planId && p.isActive);
    if (!plan) redirect("/plans?billing=error");
    const current = mockStore.plans.find((p) => p.name === mockStore.subscription.planName);
    if (current && plan.monthlyPriceUsd < current.monthlyPriceUsd) {
      mockStore.subscription.pendingPlanName = plan.name; // starts at period end
    } else {
      mockStore.subscription.planName = plan.name;
      mockStore.subscription.quota = plan.conversationQuota;
      mockStore.subscription.pendingPlanName = null;
    }
    done("/plans?billing=changed");
  }
  if (!isBillingConfigured) redirect("/plans");

  const { supabase, user } = await requireSupabaseUser();
  const now = new Date().toISOString();

  const [{ data: target }, { data: currentRow }] = await Promise.all([
    supabase
      .from("subscription_tiers")
      .select("id, name, stripe_price_id, monthly_price_usd_cents, is_active")
      .eq("id", planId)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("stripe_subscription_id, subscription_tiers ( monthly_price_usd_cents )")
      .eq("company_id", user.id)
      .in("status", ["active", "canceled"])
      .lte("current_period_start", now)
      .gt("current_period_end", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!target || !target.is_active) redirect("/plans?billing=error");

  const currentPrice = currentRow?.subscription_tiers?.monthly_price_usd_cents ?? 0;
  const stripeSubId = currentRow?.stripe_subscription_id ?? null;

  // No Stripe subscription yet (Free, or a plan granted by hand): pay through checkout.
  if (!stripeSubId) {
    if (target.monthly_price_usd_cents > 0) return startCheckout(formData);
    redirect("/plans"); // already on Free
  }

  const stripe = getStripe();
  try {
    const sub = await stripe.subscriptions.retrieve(stripeSubId, { expand: ["schedule"] });
    const item = sub.items.data[0];
    if (!item) throw new Error("Subscription has no items");

    if (target.monthly_price_usd_cents === 0) {
      // → Free: cancel when the paid period ends.
      await releaseSchedule(stripe, sub);
      await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
    } else if (!target.stripe_price_id) {
      throw new Error("Plan has no Stripe price");
    } else if (target.monthly_price_usd_cents > currentPrice) {
      // → pricier plan: switch now and charge the difference for this period.
      await releaseSchedule(stripe, sub);
      await stripe.subscriptions.update(sub.id, {
        items: [{ id: item.id, price: target.stripe_price_id }],
        cancel_at_period_end: false,
        proration_behavior: "always_invoice",
        payment_behavior: "error_if_incomplete",
      });
    } else if (target.monthly_price_usd_cents < currentPrice) {
      // → cheaper paid plan: switch at the end of the period.
      const scheduleRef = sub.schedule;
      const schedule = scheduleRef
        ? typeof scheduleRef === "string"
          ? await stripe.subscriptionSchedules.retrieve(scheduleRef)
          : scheduleRef
        : await stripe.subscriptionSchedules.create({ from_subscription: sub.id });
      const first = schedule.phases[0];
      await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: "release",
        phases: [
          {
            items: [{ price: item.price.id, quantity: 1 }],
            start_date: first.start_date,
            end_date: first.end_date,
          },
          {
            items: [{ price: target.stripe_price_id, quantity: 1 }],
            duration: { interval: "month", interval_count: 1 },
          },
        ],
      });
      await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false });
    }
  } catch (error) {
    console.error("Stripe plan change failed", error);
    redirect("/plans?billing=error");
  }

  done("/plans?billing=changed");
}

/** Cancels a planned downgrade: the company simply keeps its current plan. */
export async function keepCurrentPlan(): Promise<void> {
  if (isMockMode) {
    mockStore.subscription.pendingPlanName = null;
    done("/plans?billing=kept");
  }
  if (!isBillingConfigured) redirect("/plans");

  const { supabase, user } = await requireSupabaseUser();
  const now = new Date().toISOString();
  const { data: row } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("company_id", user.id)
    .not("stripe_subscription_id", "is", null)
    .in("status", ["active", "canceled"])
    .lte("current_period_start", now)
    .gt("current_period_end", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row?.stripe_subscription_id) redirect("/plans");

  try {
    const stripe = getStripe();
    const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id, {
      expand: ["schedule"],
    });
    await releaseSchedule(stripe, sub);
    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: false });
  } catch (error) {
    console.error("Stripe keep-plan failed", error);
    redirect("/plans?billing=error");
  }
  done("/plans?billing=kept");
}

/** Opens Stripe's billing portal: update card, see invoices. */
export async function openBillingPortal(): Promise<void> {
  if (isMockMode || !isBillingConfigured) redirect("/settings");

  const { supabase, user } = await requireSupabaseUser();
  const { data: customer } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("company_id", user.id)
    .maybeSingle();
  if (!customer) redirect("/plans");

  let url: string | null = null;
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${await siteOrigin()}/settings`,
    });
    url = session.url;
  } catch (error) {
    console.error("Stripe portal failed", error);
  }
  redirect(url ?? "/settings?billing=error");
}
