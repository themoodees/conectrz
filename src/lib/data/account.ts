import type { CompanyAccount } from "@/types/account";
import { mockCompanyAccount } from "@/mocks/account";

export async function getCurrentCompanyAccount(): Promise<CompanyAccount | null> {
  // TODO(supabase): read the auth session and the matching company_profiles row.
  return mockCompanyAccount;
}
