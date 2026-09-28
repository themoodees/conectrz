import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AccountPaused } from "@/components/layout/AccountPaused";
import { AppHeader } from "@/components/layout/AppHeader";
import { WrongAccountType } from "@/components/layout/WrongAccountType";
import { isMockMode } from "@/lib/config";
import { ensureCompanyProfile, getCurrentCompanyAccount } from "@/lib/data/account";
import { getCurrentRole, getSupabaseSession } from "@/lib/data/session";

/** Shell for all Company-facing screens (Discover, Saved, Messages, profiles, settings). */
export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  // Per-user pages: always render on request (also in mock mode).
  await connection();

  let account = await getCurrentCompanyAccount();

  if (!isMockMode) {
    const { supabase, user } = await getSupabaseSession();
    if (!user) redirect("/login");
    if ((await getCurrentRole()) !== "company") {
      return <WrongAccountType areaName="companies" />;
    }
    // Company user without a company profile yet (e.g. just confirmed their email).
    if (!account) {
      await ensureCompanyProfile(supabase, user);
      account = await getCurrentCompanyAccount();
    }
    if (account && account.status !== "active") {
      return <AccountPaused status={account.status} />;
    }
  }

  return (
    <>
      <AppHeader
        area="company"
        account={account && { name: account.companyName, subtitle: account.contactEmail }}
      />
      <main>{children}</main>
    </>
  );
}
