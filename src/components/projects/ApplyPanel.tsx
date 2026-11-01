"use client";

import { useActionState, useState, useTransition } from "react";
import type { MyApplication } from "@/types/projects";
import {
  applyToProject,
  withdrawApplication,
  type ProjectActionState,
} from "@/lib/actions/projects";
import { formatShortDate, formatUsd } from "@/lib/format";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { ApplicationStatusBadge } from "./ProjectBadges";

/** The creator's application to a project: the form, or what they already sent. */
export function ApplyPanel({
  projectId,
  isOpen,
  application,
  budgetUsd,
}: {
  projectId: string;
  isOpen: boolean;
  application: MyApplication | null;
  budgetUsd: number;
}) {
  const [state, formAction, pending] = useActionState<ProjectActionState, FormData>(
    applyToProject,
    {},
  );
  const [withdrawing, startTransition] = useTransition();
  const [withdrawError, setWithdrawError] = useState<string>();

  if (application) {
    return (
      <section className="rounded-card border border-border p-5 md:p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-ink">Your application</h2>
          <ApplicationStatusBadge status={application.status} />
        </div>
        <p className="mt-1 text-xs text-muted">Sent {formatShortDate(application.createdAt)}</p>
        <p className="mt-4 text-sm text-muted">Your price</p>
        <p className="text-lg font-semibold text-ink">{formatUsd(application.proposedAmountUsd)}</p>
        <p className="mt-4 text-sm whitespace-pre-line text-graphite">{application.message}</p>
        {application.status === "submitted" && isOpen && (
          <div className="mt-5">
            <button
              type="button"
              disabled={withdrawing}
              onClick={() =>
                startTransition(async () => {
                  const result = await withdrawApplication(application.id, projectId);
                  setWithdrawError(result.error);
                })
              }
              className={buttonClass({ variant: "secondary", size: "sm" })}
            >
              Withdraw application
            </button>
            {withdrawError && (
              <p role="alert" className="mt-2 text-xs text-danger">
                {withdrawError}
              </p>
            )}
          </div>
        )}
      </section>
    );
  }

  if (!isOpen) {
    return (
      <p className="rounded-card border border-dashed border-border p-5 text-sm text-muted">
        This project is closed and no longer takes applications.
      </p>
    );
  }

  return (
    <section className="rounded-card border border-border p-5 md:p-6">
      <h2 className="text-base font-semibold text-ink">Apply to this project</h2>
      <p className="mt-1 text-sm text-muted">
        Tell the company why you&apos;re a good fit and what you&apos;d charge. You can&apos;t edit an
        application once it&apos;s sent, but you can withdraw it.
      </p>
      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="projectId" value={projectId} />
        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
        {state.success && <FormMessage tone="success">{state.success}</FormMessage>}
        <TextAreaField
          label="Your message"
          name="message"
          required
          rows={5}
          maxLength={2000}
          placeholder="Why you're a good fit, similar work you've done, timing…"
        />
        <TextField
          label="Your price (USD)"
          name="amount"
          required
          inputMode="numeric"
          placeholder={String(budgetUsd)}
          hint={`The company's budget is ${formatUsd(budgetUsd)}.`}
          className="max-w-xs"
        />
        <button type="submit" disabled={pending} className={buttonClass()}>
          {pending ? "Sending…" : "Send application"}
        </button>
      </form>
    </section>
  );
}
