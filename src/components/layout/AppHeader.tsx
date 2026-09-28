import { Logo } from "@/components/ui/Logo";
import { AccountMenu } from "./AccountMenu";
import { MainNav } from "./MainNav";
import { MobileTabBar } from "./MobileTabBar";
import { NAV_BY_AREA, type AppArea } from "./navItems";

interface AppHeaderProps {
  /** Which nav + account menu to show (configured in navItems.ts). */
  area: AppArea;
  account: { name: string; subtitle?: string } | null;
  /** Small label next to the logo, e.g. "Creator" or "Admin". */
  areaLabel?: string;
}

/** App header shared by the company, creator and admin areas. */
export function AppHeader({ area, account, areaLabel }: AppHeaderProps) {
  const homeHref = NAV_BY_AREA[area][0].href;
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-page items-center gap-8 px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo href={homeHref} />
            {areaLabel && (
              <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-semibold text-graphite">
                {areaLabel}
              </span>
            )}
          </div>
          <MainNav area={area} />
          <div className="ml-auto">
            {account && (
              <AccountMenu area={area} name={account.name} subtitle={account.subtitle} />
            )}
          </div>
        </div>
      </header>
      <MobileTabBar area={area} />
    </>
  );
}
