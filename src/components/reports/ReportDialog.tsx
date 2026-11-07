"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { submitReport, type ReportState, type ReportTargetType } from "@/lib/actions/reports";
import { FormMessage } from "@/components/ui/FormMessage";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FlagIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";

/** English labels (admin panel). The dialog itself uses `app.report.reasons`. */
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
  const t = useTranslations("app.report");
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
        {t("report")}
      </button>

      <Modal
        title={t("title", { name: targetName })}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {state.done ? (
          <div className="space-y-5">
            <FormMessage tone="success">{t("thanks")}</FormMessage>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={buttonClass({ variant: "secondary", className: "w-full" })}
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
            <SelectField
              label={t("reason")}
              name="reason"
              required
              placeholder={t("choose")}
              defaultValue=""
              options={Object.keys(REPORT_REASON_LABELS).map((value) => ({
                value,
                label: t(`reasons.${value}` as never),
              }))}
            />
            <TextAreaField
              label={t("details")}
              name="details"
              maxLength={2000}
              placeholder={t("detailsPlaceholder")}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={buttonClass({ variant: "ghost" })}
              >
                {t("cancel")}
              </button>
              <button type="submit" disabled={pending} className={buttonClass()}>
                {pending ? t("sending") : t("send")}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
