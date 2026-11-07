"use client";

import { useTranslations } from "next-intl";
import { buttonClass } from "@/components/ui/buttonStyles";

/** Shown when loading data for a company page fails. */
export default function CompanyError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("app.companyError");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("text")}</p>
      <button type="button" onClick={reset} className={buttonClass({ className: "mt-6" })}>
        {t("retry")}
      </button>
    </div>
  );
}
