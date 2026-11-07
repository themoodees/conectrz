"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AppNotification } from "@/types/notifications";
import { formatConversationTime } from "@/lib/format";
import { useDismiss } from "@/lib/useDismiss";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import { BellIcon } from "@/components/ui/icons";

const REFRESH_MS = 60_000;

/** Header bell: unread badge and a dropdown with the latest notifications. */
export function NotificationMenu({
  items,
  unreadCount,
}: {
  items: AppNotification[];
  unreadCount: number;
}) {
  const router = useRouter();
  const t = useTranslations("app.notifications");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismiss(containerRef, isOpen, () => setIsOpen(false));

  // Pick up new notifications while the tab is open.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? t("labelUnread", { count: unreadCount }) : t("label")}
        className="relative grid size-10 place-items-center rounded-full text-graphite transition-colors hover:bg-surface hover:text-ink"
      >
        <BellIcon className="size-[22px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] leading-[18px] font-semibold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="fixed top-16 right-2 left-2 z-40 mt-2 rounded-card border border-border bg-white shadow-popover sm:absolute sm:top-full sm:right-0 sm:left-auto sm:w-96"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold text-ink">{t("label")}</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllNotificationsRead(items.map((i) => i.id))}
                className="text-xs font-medium text-primary hover:underline"
              >
                {t("markAll")}
              </button>
            )}
          </div>
          <div className="h-px bg-border" />
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted">{t("empty")}</p>
          ) : (
            <ul className="max-h-[28rem] overflow-y-auto p-1.5">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    onClick={() => {
                      setIsOpen(false);
                      if (!item.isRead) void markNotificationRead(item.id);
                    }}
                    className="flex gap-3 rounded-lg px-3 py-2.5 hover:bg-surface"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${item.isRead ? "bg-transparent" : "bg-primary"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm ${item.isRead ? "text-graphite" : "font-semibold text-ink"}`}
                      >
                        {item.title}
                      </span>
                      {item.body && (
                        <span className="block truncate text-sm text-muted">{item.body}</span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {formatConversationTime(item.createdAt, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
