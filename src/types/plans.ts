/** A subscription plan (from `subscription_tiers`). */
export interface Plan {
  id: string;
  name: string;
  monthlyPriceJpy: number;
  /** New conversations a company can start per billing period. */
  conversationQuota: number;
  isActive: boolean;
}
