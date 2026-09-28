/*
 * MOCK DATA — plans (mirrors the placeholder rows in `subscription_tiers`).
 */
export interface MockPlan {
  id: string;
  name: string;
  monthlyPriceJpy: number;
  conversationQuota: number;
  isActive: boolean;
}

export const mockPlans: MockPlan[] = [
  { id: "tier-free", name: "Free", monthlyPriceJpy: 0, conversationQuota: 1, isActive: true },
  { id: "tier-starter", name: "Starter", monthlyPriceJpy: 9800, conversationQuota: 10, isActive: true },
  { id: "tier-pro", name: "Pro", monthlyPriceJpy: 29800, conversationQuota: 50, isActive: true },
];
