"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { MyApplication } from "@/types/projects";
import {
  applyToProject,
  withdrawApplication,
  type ProjectActionState,
} from "@/lib/actions/projects";
import { sharedPaymentMethods, type PaymentMethod } from "@/lib/payments";
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
  projectMethods,
  myMethods,
}: {
  projectId: string;
  isOpen: boolean;
  application: MyApplication | null;
  budgetUsd: number;
  projectMethods: PaymentMethod[];
  myMethods: PaymentMethod[];
}) {
  const t = useTranslations("app.projects.apply");
  const locale = useLocale();
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
          <h2 className="text-base font-semibold text-ink">{t("yourApplication")}</h2>
          <ApplicationStatusBadge status={application.status} />
        </div>
        <p className="mt-1 text-xs text-muted">
          {t("sent", { date: formatShortDate(application.createdAt, locale) })}
        </p>
        <p className="mt-4 text-sm text-muted">{t("yourPrice")}</p>
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
              {t("withdraw")}
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
        {t("closedNote")}
      </p>
    );
  }

  return (
    <section className="rounded-card border border-border p-5 md:p-6">
      <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted">
        Tell the company why you&apos;re a good fit and what you&apos;d charge. You can&apos;t edit
        an application once it&apos;s sent, but you can withdraw it.
      </p>
      <form action={formAction} className="mt-5 space-y-4">
        <input type="hidden" name="projectId" value={projectId} />
        {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
        {state.success && <FormMessage tone="success">{state.success}</FormMessage>}
        <TextAreaField
          label={t("message")}
          name="message"
          required
          rows={5}
          maxLength={2000}
          placeholder={t("messagePlaceholder")}
        />
        <TextField
          label={t("priceLabel")}
          name="amount"
          required
          inputMode="numeric"
          placeholder={String(budgetUsd)}
          hint={t("budgetHint", { amount: formatUsd(budgetUsd) })}
          className="max-w-xs"
        />
        {projectMethods.length > 0 && (
          <PaymentCheck projectMethods={projectMethods} myMethods={myMethods} />
        )}
        <button type="submit" disabled={pending} className={buttonClass()}>
          {pending ? t("sending") : t("send")}
        </button>
      </form>
    </section>
  );
}

/** Tells the creator early whether the company's payment methods fit theirs. */
function PaymentCheck({
  projectMethods,
  myMethods,
}: {
  projectMethods: PaymentMethod[];
  myMethods: PaymentMethod[];
}) {
  const t = useTranslations("app.projects.apply");
  const tPay = useTranslations("app.payments.methods");
  const shared = sharedPaymentMethods(projectMethods, myMethods);
  const companyList = projectMethods.map((m) => tPay(m)).join(", ");
  const list = (methods: PaymentMethod[]) => methods.map((m) => tPay(m)).join(", ");

  const text =
    myMethods.length === 0
      ? t.rich("noMethods", {
          company: companyList,
          link: (chunks) => (
            <Link href="/creator/profile" className="font-medium underline">
              {chunks}
            </Link>
          ),
        })
      : shared.length === 0
        ? t("mismatch", { company: companyList, mine: list(myMethods) })
        : t("match", { shared: list(shared) });
  return <p className="rounded-control bg-surface px-3.5 py-2.5 text-xs text-graphite">{text}</p>;
}
