"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";

interface FilterPanelProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  canClear: boolean;
  resultCount: number;
  children: ReactNode;
}

/**
 * Modal filter panel built on the native <dialog> element
 * (focus trapping, Escape and backdrop handled by the browser).
 * Phones: bottom sheet. Tablet/desktop: right-hand drawer.
 */
export function FilterPanel({
  title,
  isOpen,
  onClose,
  onClear,
  canClear,
  resultCount,
  children,
}: FilterPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clicking the backdrop (the dialog element itself) closes the panel
      onClick={(event) => event.target === event.currentTarget && onClose()}
      aria-labelledby="filter-panel-title"
      className="m-0 mt-auto max-h-[88dvh] w-full max-w-none overflow-hidden rounded-t-2xl bg-white p-0 text-ink md:mt-0 md:ml-auto md:h-dvh md:max-h-none md:w-[420px] md:rounded-none"
    >
      <div className="flex max-h-[88dvh] flex-col md:h-full md:max-h-none">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="filter-panel-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="grid size-9 place-items-center rounded-full text-graphite hover:bg-surface"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">{children}</div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClear}
            disabled={!canClear}
            className="h-11 rounded-control px-4 text-sm font-medium text-graphite hover:bg-surface disabled:cursor-not-allowed disabled:text-muted/60 disabled:hover:bg-transparent"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-control bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Show {resultCount} {resultCount === 1 ? "creator" : "creators"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
