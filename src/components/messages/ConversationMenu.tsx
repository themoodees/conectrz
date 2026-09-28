"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import type { Viewer } from "@/types/messages";
import { setConversationArchived } from "@/lib/actions/messages";
import { useDismiss } from "@/lib/useDismiss";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { ArchiveIcon, MoreIcon } from "@/components/ui/icons";

interface ConversationMenuProps {
  conversationId: string;
  counterpartName: string;
  viewer: Viewer;
  isArchived: boolean;
}

/** "…" menu in the conversation header: archive/restore and report. */
export function ConversationMenu({
  conversationId,
  counterpartName,
  viewer,
  isArchived,
}: ConversationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(containerRef, isOpen, close);

  const toggleArchived = () =>
    startTransition(async () => {
      const result = await setConversationArchived(conversationId, viewer, !isArchived);
      setError(result.error ?? null);
      close();
    });

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-graphite hover:bg-surface hover:text-ink";

  return (
    <div ref={containerRef} className="relative ml-auto">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Conversation options"
        className="grid size-9 place-items-center rounded-full text-graphite hover:bg-surface"
      >
        <MoreIcon className="size-5" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 rounded-card border border-border bg-white p-1.5 shadow-popover"
        >
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            onClick={toggleArchived}
            className={itemClass}
          >
            <ArchiveIcon className="size-4" />
            {isArchived ? "Move to inbox" : "Archive conversation"}
          </button>
          <ReportDialog
            targetType="conversation"
            targetId={conversationId}
            targetName={`conversation with ${counterpartName}`}
            triggerClassName={itemClass}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="absolute right-0 mt-2 w-64 text-right text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
