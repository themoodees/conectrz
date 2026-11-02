"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { getStripe, isBillingConfigured } from "@/lib/stripe";

/*
 * Billing actions (company side). They only create Stripe sessions; the plan
 * itself changes when Stripe's webhook reaches the `stripe-webhook` function.
 */

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

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

/** Opens Stripe's billing portal: change plan, update card, cancel, invoices. */
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
