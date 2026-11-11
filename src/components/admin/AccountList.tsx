"use client";

import { useRef, useState, useTransition } from "react";
import type { AdminAccount } from "@/types/admin";
import type { Plan } from "@/types/plans";
import { bulkAccountAction, type BulkAccountAction } from "@/lib/actions/admin";
import { formatShortDate } from "@/lib/format";
import { useDismiss } from "@/lib/useDismiss";
import { buttonClass } from "@/components/ui/buttonStyles";
import { ChevronDownIcon } from "@/components/ui/icons";
import { AccountStatusActions } from "./AdminActionButtons";
import { StatusBadge } from "./AdminPageHeader";
import { CompanyPlanActions } from "./CompanyPlanActions";

const ACTIONS: { id: BulkAccountAction; label: string; danger?: boolean }[] = [
  { id: "pause", label: "Pause" },
  { id: "reactivate", label: "Reactivate" },
  { id: "ban", label: "Ban", danger: true },
  { id: "delete", label: "Delete permanently", danger: true },
];

const CONFIRM: Record<BulkAccountAction, (n: number) => string> = {
  pause: (n) => `Pause ${n} ${n === 1 ? "account" : "accounts"}?`,
  reactivate: (n) => `Reactivate ${n} ${n === 1 ? "account" : "accounts"}?`,
  ban: (n) => `Ban ${n} ${n === 1 ? "account" : "accounts"}? Their access will be closed.`,
  delete: (n) =>
    `Permanently delete ${n} ${n === 1 ? "account" : "accounts"} and all their data? This can't be undone.`,
};

/** Accounts with a checkbox on each row and an "Actions" menu that applies to the selection. */
export function AccountList({ accounts, plans }: { accounts: AdminAccount[]; plans: Plan[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(menuRef, menuOpen, () => setMenuOpen(false));

  const allSelected = accounts.length > 0 && selected.length === accounts.length;
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  function run(action: BulkAccountAction) {
    setMenuOpen(false);
    const count = selected.length;
    if (action === "delete") {
      const typed = window.prompt(`${CONFIRM.delete(count)}\n\nType DELETE to confirm.`);
      if (typed?.trim() !== "DELETE") return;
    } else if (!window.confirm(CONFIRM[action](count))) {
      return;
    }
    startTransition(async () => {
      const result = await bulkAccountAction(accounts[0].kind, selected, action);
      setMessage({
        text: result.error ?? result.success ?? "Done.",
        isError: Boolean(result.error),
      });
      setSelected([]);
    });
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface px-5 py-3">
        <label className="flex items-center gap-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? [] : accounts.map((a) => a.id))}
            className="size-4 accent-primary"
          />
          {selected.length > 0 ? `${selected.length} selected` : "Select all on this page"}
        </label>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            disabled={selected.length === 0 || pending}
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className={`${buttonClass({ variant: "secondary", size: "sm" })} gap-1.5`}
          >
            {pending ? "Working…" : "Actions"}
            <ChevronDownIcon className="size-4" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute left-0 z-20 mt-1 w-52 rounded-card border border-border bg-white p-1.5 shadow-popover"
            >
              {ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  role="menuitem"
                  onClick={() => run(action.id)}
                  className={`flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface ${
                    action.danger ? "text-danger" : "text-graphite hover:text-ink"
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {message && (
          <p
            role={message.isError ? "alert" : "status"}
            className={`text-sm ${message.isError ? "text-danger" : "text-graphite"}`}
          >
            {message.text}
          </p>
        )}
      </div>

      <ul className="divide-y divide-border rounded-card border border-border">
        {accounts.map((account) => (
          <li key={account.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
            <input
              type="checkbox"
              checked={selected.includes(account.id)}
              onChange={() => toggle(account.id)}
              aria-label={`Select ${account.name}`}
              className="size-4 accent-primary"
            />
            <div className="min-w-0 flex-1 basis-60">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-ink">{account.name}</span>
                <StatusBadge status={account.status} />
              </div>
              {account.email && <p className="truncate text-sm text-graphite">{account.email}</p>}
              <p className="truncate text-sm text-muted">
                {account.kind === "creator" ? `${account.detail} · ` : ""}joined{" "}
                {formatShortDate(account.createdAt)}
              </p>
            </div>
            {account.kind === "company" && (
              <div className="text-sm">
                <span className="text-muted">Plan: </span>
                <span className="font-medium text-ink">{account.planName ?? "None"}</span>
                {account.planPeriodEnd && (
                  <span className="text-muted">
                    {" "}
                    · until {formatShortDate(account.planPeriodEnd)}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {account.kind === "company" && (
                <CompanyPlanActions
                  companyId={account.id}
                  companyName={account.name}
                  currentPlanName={account.planName ?? null}
                  plans={plans}
                />
              )}
              <AccountStatusActions
                kind={account.kind}
                accountId={account.id}
                name={account.name}
                status={account.status}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
