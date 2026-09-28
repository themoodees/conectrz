"use client";

import { useRef, useState } from "react";
import type { CompanyAccount } from "@/types/account";
import { getInitials } from "@/lib/format";
import { useDismiss } from "@/lib/useDismiss";
import { signOut } from "@/lib/actions/auth";
import { ChevronDownIcon, LogOutIcon, SettingsIcon } from "@/components/ui/icons";

/**
 * Company/account dropdown.
 * "Account settings" stays disabled until that page is built.
 */
export function AccountMenu({ account }: { account: CompanyAccount }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(containerRef, isOpen, () => setIsOpen(false));

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
          {getInitials(account.companyName)}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-ink sm:block">
          {account.companyName}
        </span>
        <ChevronDownIcon className="hidden size-4 text-muted sm:block" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 rounded-card border border-border bg-white p-1.5 shadow-popover"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">{account.companyName}</p>
            <p className="truncate text-xs text-muted">{account.contactEmail}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          <MenuItem icon={<SettingsIcon className="size-4" />} label="Account settings" disabled />
          <form action={signOut}>
            <MenuItem icon={<LogOutIcon className="size-4" />} label="Sign out" type="submit" />
          </form>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  type = "button",
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      role="menuitem"
      disabled={disabled}
      title={disabled ? "Coming soon" : undefined}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-graphite enabled:hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  );
}
