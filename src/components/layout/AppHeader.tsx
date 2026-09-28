import type { CompanyAccount } from "@/types/account";
import { Logo } from "@/components/ui/Logo";
import { AccountMenu } from "./AccountMenu";
import { MainNav } from "./MainNav";
import { MobileTabBar } from "./MobileTabBar";

/**
 * Company app header. `account` is passed in from the layout so it can
 * later come from the Supabase session without touching this component.
 */
export function AppHeader({ account }: { account: CompanyAccount | null }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-page items-center gap-8 px-4 md:px-6 lg:px-8">
          <Logo />
          <MainNav />
          <div className="ml-auto">{account && <AccountMenu account={account} />}</div>
        </div>
      </header>
      <MobileTabBar />
    </>
  );
}
