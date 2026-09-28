"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { getInitials } from "@/lib/format";
import { useDismiss } from "@/lib/useDismiss";
import { signOut } from "@/lib/actions/auth";
import { ChevronDownIcon, LogOutIcon } from "@/components/ui/icons";
import { ACCOUNT_MENU_LINKS, type AppArea } from "./navItems";

interface AccountMenuProps {
  area: AppArea;
  name: string;
  /** Second line in the menu, e.g. an email address. */
  subtitle?: string;
}

/** Account dropdown in the header: links + sign out. */
export function AccountMenu({ area, name, subtitle }: AccountMenuProps) {
  const links = ACCOUNT_MENU_LINKS[area];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(containerRef, isOpen, () => setIsOpen(false));

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-graphite hover:bg-surface hover:text-ink";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-surface"
      >
        <span className="grid size-8 place-items-center rounded-full bg-primary-light text-xs font-semibold text-primary">
          {getInitials(name)}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-ink sm:block">
          {name}
        </span>
        <ChevronDownIcon className="hidden size-4 text-muted sm:block" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 rounded-card border border-border bg-white p-1.5 shadow-popover"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
          </div>
          <div className="my-1 h-px bg-border" />
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className={itemClass}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
          <form action={signOut}>
            <button type="submit" role="menuitem" className={itemClass}>
              <LogOutIcon className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
