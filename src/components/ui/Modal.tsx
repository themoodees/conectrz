"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./icons";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Centered dialog built on the native <dialog> element
 * (focus trapping, Escape and backdrop are handled by the browser).
 */
export function Modal({ title, isOpen, onClose, children }: ModalProps) {
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
      onClick={(event) => event.target === event.currentTarget && onClose()}
      aria-label={title}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card bg-white p-0 text-ink shadow-popover"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-9 place-items-center rounded-full text-graphite hover:bg-surface"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
}
