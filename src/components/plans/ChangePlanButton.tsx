"use client";

import { useState } from "react";
import { changePlan } from "@/lib/actions/billing";
import { buttonClass } from "@/components/ui/buttonStyles";

/**
 * "Change to X" with a confirmation step, so a plan (and a charge) is never changed
 * by one accidental click. `note` says exactly what will happen.
 */
export function ChangePlanButton({
  planId,
  planName,
  primary,
  note,
}: {
  planId: string;
  planName: string;
  primary: boolean;
  note: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={buttonClass({ variant: primary ? "primary" : "secondary", className: "mt-6" })}
      >
        Change to {planName}
      </button>
    );
  }

  return (
    <form action={changePlan} className="mt-6 rounded-control border border-border bg-surface p-3">
      <input type="hidden" name="planId" value={planId} />
      <p className="text-sm text-graphite">{note}</p>
      <div className="mt-3 flex gap-2">
        <button type="submit" className={buttonClass({ size: "sm" })}>
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={buttonClass({ variant: "ghost", size: "sm" })}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
