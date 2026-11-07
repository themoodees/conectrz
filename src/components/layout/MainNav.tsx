"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { NAV_BY_AREA, isNavItemActive, type AppArea } from "./navItems";

/** Desktop/tablet navigation links inside the header. */
export function MainNav({ area }: { area: AppArea }) {
  const pathname = usePathname();
  const t = useTranslations("app.nav");
  const items = NAV_BY_AREA[area];

  return (
    <nav aria-label={t("main")} className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item.activeFor);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-16 items-center px-3 text-sm font-medium transition-colors ${
                  isActive ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {item.labelKey ? t(item.labelKey) : item.label}
                {isActive && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
