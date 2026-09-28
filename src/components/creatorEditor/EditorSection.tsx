import type { ReactNode } from "react";
import type { SaveResult } from "@/lib/actions/creatorProfile";

/** A titled card in the profile editor. */
export function EditorSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-card border border-border p-5 md:p-6">
      <h2 className="font-sans text-base font-semibold tracking-normal text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** "Save" button with inline success/error text. */
export function SaveRow({
  onSave,
  pending,
  result,
  label = "Save",
}: {
  onSave?: () => void;
  pending: boolean;
  result: SaveResult;
  label?: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type={onSave ? "button" : "submit"}
        onClick={onSave}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/40"
      >
        {pending ? "Saving…" : label}
      </button>
      {result.error && (
        <p role="alert" className="text-sm text-danger">
          {result.error}
        </p>
      )}
      {result.success && !pending && (
        <p role="status" className="text-sm text-graphite">
          {result.success}
        </p>
      )}
    </div>
  );
}

/** Small "remove row" button used in repeating rows. */
export const rowRemoveClass =
  "grid size-10 shrink-0 place-items-center rounded-control text-muted hover:bg-surface hover:text-danger";

/** Compact input styles for dense editor rows. */
export const rowInputClass =
  "h-10 w-full min-w-0 rounded-control border border-border bg-white px-3 text-sm text-ink placeholder:text-muted hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none focus-visible:outline-none";
