import "server-only";
import { isMockMode } from "@/lib/config";
import { isBillingConfigured } from "@/lib/stripe";
import { getSupabaseSession } from "./session";

export interface BillingStatus {
  /** Stripe checkout is available (Supabase mode + Stripe key set). */
  enabled: boolean;
  /** The company already has a Stripe customer, so the billing portal works. */
  hasCustomer: boolean;
}

export async function getBillingStatus(): Promise<BillingStatus> {
  if (isMockMode || !isBillingConfigured) return { enabled: false, hasCustomer: false };

  const { supabase, user } = await getSupabaseSession();
  if (!user) return { enabled: true, hasCustomer: false };
  const { data } = await supabase
    .from("billing_customers")
    .select("company_id")
    .eq("company_id", user.id)
    .maybeSingle();
  return { enabled: true, hasCustomer: Boolean(data) };
}
