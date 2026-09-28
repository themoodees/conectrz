/** Mirrors the `account_status` enum. "deleted" is used for banned accounts. */
export type AccountStatus = "active" | "paused" | "deleted";

/** The signed-in Company (from `company_profiles`). */
export interface CompanyAccount {
  id: string;
  companyName: string;
  contactEmail: string;
  status: AccountStatus;
}
