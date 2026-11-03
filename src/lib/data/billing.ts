import "server-only";
import { isMockMode } from "@/lib/config";
import { getStripe, isBillingConfigured } from "@/lib/stripe";
import { mockStore } from "@/mocks/store";
import { getSupabaseSession } from "./session";

export interface PendingPlanChange {
  /** The plan the company moves to. */
  planName: string;
  /** ISO date when the change starts (end of the current period). */
  effectiveOn: string;
}

export interface BillingStatus {
  /** Plans can be changed in the app (Stripe configured, or mock mode for design work). */
  enabled: boolean;
  /** The company already has a Stripe customer, so the billing portal works. */
  hasCustomer: boolean;
  /** A downgrade or cancellation that starts at the end of the period, if any. */
  pendingChange: PendingPlanChange | null;
}

const unix = (seconds: number) => new Date(seconds * 1000).toISOString();

export async function getBillingStatus(): Promise<BillingStatus> {
  if (isMockMode) {
    const { pendingPlanName, periodEnd } = mockStore.subscription;
    return {
      enabled: true,
      hasCustomer: false,
      pendingChange: pendingPlanName ? { planName: pendingPlanName, effectiveOn: periodEnd } : null,
    };
  }
  if (!isBillingConfigured) return { enabled: false, hasCustomer: false, pendingChange: null };

  const { supabase, user } = await getSupabaseSession();
  if (!user) return { enabled: true, hasCustomer: false, pendingChange: null };

  const now = new Date().toISOString();
  const [{ data: customer }, { data: sub }] = await Promise.all([
    supabase.from("billing_customers").select("company_id").eq("company_id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("company_id", user.id)
      .not("stripe_subscription_id", "is", null)
      .in("status", ["active", "canceled"])
      .lte("current_period_start", now)
      .gt("current_period_end", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let pendingChange: PendingPlanChange | null = null;
  if (sub?.stripe_subscription_id) {
    try {
      const stripeSub = await getStripe().subscriptions.retrieve(sub.stripe_subscription_id, {
        expand: ["schedule"],
      });
      const item = stripeSub.items.data[0];
      const periodEnd = item?.current_period_end;
      if (stripeSub.cancel_at_period_end && periodEnd) {
        pendingChange = { planName: "Free", effectiveOn: unix(periodEnd) };
      } else if (typeof stripeSub.schedule === "object" && stripeSub.schedule) {
        const next = stripeSub.schedule.phases.find((phase) => phase.start_date * 1000 > Date.now());
        const price = next?.items[0]?.price;
        const priceId = typeof price === "string" ? price : price?.id;
        if (next && priceId) {
          const { data: tier } = await supabase
            .from("subscription_tiers")
            .select("name")
            .eq("stripe_price_id", priceId)
            .maybeSingle();
          if (tier) pendingChange = { planName: tier.name, effectiveOn: unix(next.start_date) };
        }
      }
    } catch (error) {
      console.error("Couldn't read the Stripe subscription", error);
    }
  }

  return { enabled: true, hasCustomer: Boolean(customer), pendingChange };
}
