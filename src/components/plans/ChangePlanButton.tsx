"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { changePlan } from "@/lib/actions/billing";
import { buttonClass } from "@/components/ui/buttonStyles";
import { SubmitButton } from "@/components/ui/SubmitButton";

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
  const t = useTranslations("app.plans");
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={buttonClass({ variant: primary ? "primary" : "secondary", className: "mt-6" })}
      >
        {t("changeTo", { plan: planName })}
      </button>
    );
  }

  return (
    <form action={changePlan} className="mt-6 rounded-control border border-border bg-surface p-3">
      <input type="hidden" name="planId" value={planId} />
      <p className="text-sm text-graphite">{note}</p>
      <div className="mt-3 flex gap-2">
        <SubmitButton pendingLabel={t("changing")} className={buttonClass({ size: "sm" })}>
          {t("confirm")}
        </SubmitButton>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={buttonClass({ variant: "ghost", size: "sm" })}
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
