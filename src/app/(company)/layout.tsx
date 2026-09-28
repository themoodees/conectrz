import { AppHeader } from "@/components/layout/AppHeader";
import { getCurrentCompanyAccount } from "@/lib/data/account";

/** Shell for all Company-facing app screens (Discover, Saved, Messages…). */
export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const account = await getCurrentCompanyAccount();

  return (
    <>
      <AppHeader account={account} />
      {/* Bottom padding leaves room for the mobile tab bar */}
      <main className="pb-24 md:pb-16">{children}</main>
    </>
  );
}
