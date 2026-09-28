"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_BY_AREA, isNavItemActive, type AppArea } from "./navItems";

/** Bottom tab bar replacing the header links on small screens. */
export function MobileTabBar({ area }: { area: AppArea }) {
  const pathname = usePathname();
  const items = NAV_BY_AREA[area];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ label, href, icon: Icon, activeFor }) => {
          const isActive = isNavItemActive(pathname, activeFor);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${
                  isActive ? "text-primary" : "text-muted"
                }`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
