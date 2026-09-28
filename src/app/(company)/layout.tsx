import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppHeader } from "@/components/layout/AppHeader";
import { CompanyAccountRequired } from "@/components/layout/CompanyAccountRequired";
import { getCurrentCompanyAccount } from "@/lib/data/account";
import { getSupabaseSession } from "@/lib/data/session";
import { isMockMode } from "@/lib/config";

/** Shell for all Company-facing app screens (Discover, Saved, Messages, profiles). */
export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  // Per-user pages: always render on request (also in mock mode).
  await connection();
  const account = await getCurrentCompanyAccount();

  if (!account && !isMockMode) {
    const { user } = await getSupabaseSession();
    if (!user) redirect("/login");
    // Signed in, but not as a company (e.g. a creator account).
    return <CompanyAccountRequired />;
  }

  return (
    <>
      <AppHeader account={account} />
      <main>{children}</main>
    </>
  );
}
