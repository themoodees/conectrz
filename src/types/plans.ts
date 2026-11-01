/** A subscription plan (from `subscription_tiers`). Prices are in whole US dollars. */
export interface Plan {
  id: string;
  name: string;
  monthlyPriceUsd: number;
  /** New conversations a company can start per billing period. `null` = unlimited. */
  conversationQuota: number | null;
  /** Fair-use cap on new conversations per rolling 24 hours. `null` = no daily cap. */
  dailyNewConversationLimit: number | null;
  isActive: boolean;
}
