"use client";

import { useState, useTransition } from "react";
import { sendReminders, sendReminderTest, type AdminResult } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/buttonStyles";

/** Test + send buttons for the "complete your profile" reminder. */
export function ReminderPanel({ total }: { total: number }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminResult>({});

  const run = (action: () => Promise<AdminResult>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => setResult(await action()));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(sendReminderTest)}
          className={buttonClass({ variant: "secondary" })}
        >
          Send test to my email
        </button>
        <button
          type="button"
          disabled={pending || total === 0}
          onClick={() =>
            run(
              () => sendReminders(total),
              `Send the reminder to ${total} creators now? Each person gets it once and it can't be undone.`,
            )
          }
          className={buttonClass()}
        >
          {pending ? "Working…" : `Send to ${total} creators`}
        </button>
      </div>
      {result.error && (
        <p role="alert" className="text-sm text-danger">
          {result.error}
        </p>
      )}
      {result.success && (
        <p role="status" className="text-sm text-ink">
          {result.success}
        </p>
      )}
    </div>
  );
}
