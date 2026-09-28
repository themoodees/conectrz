/**
 * The signed-in Company as the app shell needs it.
 * Later populated from Supabase auth + `company_profiles`.
 */
export interface CompanyAccount {
  id: string;
  companyName: string;
  contactEmail: string;
}
