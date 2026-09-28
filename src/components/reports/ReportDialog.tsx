"use client";

import { useActionState, useState } from "react";
import { submitReport, type ReportState, type ReportTargetType } from "@/lib/actions/reports";
import { FormMessage } from "@/components/ui/FormMessage";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FlagIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";

export const REPORT_REASON_LABELS: Record<string, string> = {
  fake_profile: "Fake profile",
  spam: "Spam",
  inappropriate_content: "Inappropriate content",
  harassment: "Harassment",
  no_response: "No response",
  other: "Other",
};

interface ReportDialogProps {
  targetType: ReportTargetType;
  targetId: string;
  /** Shown in the dialog title, e.g. "Report Yui Tanaka". */
  targetName: string;
  /** Custom trigger styling (defaults to a small text link). */
  triggerClassName?: string;
}

/** "Report" link + dialog. Reports go to the admin panel for review. */
export function ReportDialog({
  targetType,
  targetId,
  targetName,
  triggerClassName,
}: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ReportState, FormData>(submitReport, {});

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          "inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        }
      >
        <FlagIcon className="size-4" />
        Report
      </button>

      <Modal title={`Report ${targetName}`} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {state.done ? (
          <div className="space-y-5">
            <FormMessage tone="success">Thanks — our team will review your report.</FormMessage>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={buttonClass({ variant: "secondary", className: "w-full" })}
            >
              Close
            </button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
            <SelectField
              label="Reason"
              name="reason"
              required
              placeholder="Choose a reason"
              defaultValue=""
              options={Object.entries(REPORT_REASON_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <TextAreaField
              label="Details (optional)"
              name="details"
              maxLength={2000}
              placeholder="Tell us what happened"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={buttonClass({ variant: "ghost" })}
              >
                Cancel
              </button>
              <button type="submit" disabled={pending} className={buttonClass()}>
                {pending ? "Sending…" : "Send report"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
