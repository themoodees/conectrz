"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useDismiss } from "@/lib/useDismiss";
import { ChevronDownIcon } from "@/components/ui/icons";

interface FilterDropdownProps {
  label: string;
  selectedCount: number;
  onClear: () => void;
  children: ReactNode;
}

/** Desktop toolbar button that opens a small popover with one filter's options. */
export function FilterDropdown({ label, selectedCount, onClear, children }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(containerRef, isOpen, close);

  const isActive = selectedCount > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={`flex h-10 items-center gap-1.5 rounded-control border px-3.5 text-sm font-medium transition-colors ${
          isActive
            ? "border-primary bg-primary-light text-primary"
            : "border-border bg-white text-graphite hover:border-muted/50 hover:text-ink"
        } ${isOpen && !isActive ? "border-muted/50 text-ink" : ""}`}
      >
        {label}
        {isActive && (
          <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white">
            {selectedCount}
          </span>
        )}
        <ChevronDownIcon className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 w-80 rounded-card border border-border bg-white shadow-popover">
          <div className="max-h-80 overflow-y-auto p-4">{children}</div>
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <button
              type="button"
              onClick={onClear}
              disabled={!isActive}
              className="text-sm font-medium text-graphite hover:text-ink disabled:cursor-not-allowed disabled:text-muted/60"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-light"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
