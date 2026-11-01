import "server-only";
import type { Plan } from "@/types/plans";
import { isMockMode } from "@/lib/config";
import { centsToUsd } from "@/lib/format";
import { mockStore } from "@/mocks/store";
import { getSupabaseSession } from "./session";

/** Plans, cheapest first. Pass `includeInactive` for the admin panel. */
export async function getPlans({ includeInactive = false } = {}): Promise<Plan[]> {
  if (isMockMode) {
    return mockStore.plans
      .filter((plan) => includeInactive || plan.isActive)
      .sort((a, b) => a.monthlyPriceUsd - b.monthlyPriceUsd);
  }

  const { supabase } = await getSupabaseSession();
  let query = supabase
    .from("subscription_tiers")
    .select("id, name, monthly_price_usd_cents, conversation_quota, daily_new_conversation_limit, is_active")
    .order("monthly_price_usd_cents");
  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    monthlyPriceUsd: centsToUsd(row.monthly_price_usd_cents),
    conversationQuota: row.conversation_quota,
    dailyNewConversationLimit: row.daily_new_conversation_limit,
    isActive: row.is_active,
  }));
}
