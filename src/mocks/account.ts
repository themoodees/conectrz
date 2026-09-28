import type { CompanyAccount } from "@/types/account";

/* MOCK DATA — stands in for the signed-in Company until Supabase auth is wired. */
export const mockCompanyAccount: CompanyAccount = {
  id: "co-001",
  companyName: "Hanami Cosmetics",
  contactEmail: "marketing@hanami-cosmetics.jp",
  status: "active",
};

/* MOCK DATA — in mock mode, the creator area (/creator) acts as this creator. */
export const MOCK_CREATOR_ID = "cr-001";
