import "server-only";
import type { Plan } from "@/types/plans";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/mocks/store";
import { getSupabaseSession } from "./session";

/** Plans, cheapest first. Pass `includeInactive` for the admin panel. */
export async function getPlans({ includeInactive = false } = {}): Promise<Plan[]> {
  if (isMockMode) {
    return mockStore.plans
      .filter((plan) => includeInactive || plan.isActive)
      .sort((a, b) => a.monthlyPriceJpy - b.monthlyPriceJpy);
  }

  const { supabase } = await getSupabaseSession();
  let query = supabase
    .from("subscription_tiers")
    .select("id, name, monthly_price_jpy, conversation_quota, is_active")
    .order("monthly_price_jpy");
  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    monthlyPriceJpy: row.monthly_price_jpy,
    conversationQuota: row.conversation_quota,
    isActive: row.is_active,
  }));
}
