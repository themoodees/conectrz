/*
 * MOCK DATA — plans (mirrors `subscription_tiers`). Prices in whole US dollars.
 */
export interface MockPlan {
  id: string;
  name: string;
  monthlyPriceUsd: number;
  /** `null` = unlimited. */
  conversationQuota: number | null;
  dailyNewConversationLimit: number | null;
  isActive: boolean;
}

export const mockPlans: MockPlan[] = [
  {
    id: "tier-free",
    name: "Free",
    monthlyPriceUsd: 0,
    conversationQuota: 0,
    dailyNewConversationLimit: null,
    isActive: true,
  },
  {
    id: "tier-pro",
    name: "Pro",
    monthlyPriceUsd: 39,
    conversationQuota: 10,
    dailyNewConversationLimit: null,
    isActive: true,
  },
  {
    id: "tier-business",
    name: "Business",
    monthlyPriceUsd: 99,
    conversationQuota: null,
    dailyNewConversationLimit: 10,
    isActive: true,
  },
];
