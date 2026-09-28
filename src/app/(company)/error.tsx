"use client";

import { buttonClass } from "@/components/ui/buttonStyles";

/** Shown when loading data for a company page fails. */
export default function CompanyError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-2 text-muted">We couldn&apos;t load this page. Please try again.</p>
      <button type="button" onClick={reset} className={buttonClass({ className: "mt-6" })}>
        Try again
      </button>
    </div>
  );
}
