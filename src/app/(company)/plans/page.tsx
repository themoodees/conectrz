import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonClass } from "@/components/ui/buttonStyles";
import { CheckIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL } from "@/lib/config";
import { getCurrentCompanyAccount } from "@/lib/data/account";
import { getBillingStatus } from "@/lib/data/billing";
import { getConversationUsage } from "@/lib/data/messages";
import { keepCurrentPlan } from "@/lib/actions/billing";
import { AutoRefresh } from "@/components/plans/AutoRefresh";
import { ChangePlanButton } from "@/components/plans/ChangePlanButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getPlans } from "@/lib/data/plans";
import { formatUsd, formatShortDate } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.plans");
  return { title: t("title") };
}

/**
 * With Stripe configured (or in mock mode), companies change plans here themselves:
 * upgrades start immediately, downgrades and Free start when the current period ends.
 * Without Stripe, "Request" opens an email and an admin switches the plan.
 */
export default async function PlansPage({ searchParams }: PageProps<"/plans">) {
  const { billing: billingResult, detail } = await searchParams;
  const [t, locale] = await Promise.all([getTranslations("app.plans"), getLocale()]);
  const [plans, usage, account, billing] = await Promise.all([
    getPlans(),
    getConversationUsage(),
    getCurrentCompanyAccount(),
    getBillingStatus(),
  ]);
  const current = plans.find((plan) => plan.name === usage?.planName);
  const currentPrice = current?.monthlyPriceUsd ?? 0;
  const periodEnd = usage ? formatShortDate(usage.periodEnd, locale) : "";

  /** What will happen if the company changes to this plan (shown before confirming). */
  const changeNote = (plan: (typeof plans)[number]) => {
    if (plan.monthlyPriceUsd > currentPrice) {
      return currentPrice > 0
        ? t("noteUpgrade", { plan: plan.name, date: periodEnd })
        : t("noteFirstPaid", { plan: plan.name });
    }
    return current
      ? t("noteDowngrade", { current: current.name, date: periodEnd, plan: plan.name })
      : t("noteDowngradeNoPlan", { date: periodEnd, plan: plan.name });
  };

  const requestHref = (planName: string) =>
    `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `Plan request: ${planName}`,
    )}&body=${encodeURIComponent(
      `Hello Conectrz team,\n\nWe'd like to switch to the ${planName} plan.\n\nCompany: ${account?.companyName ?? ""}\nAccount email: ${account?.contactEmail ?? ""}\n`,
    )}`;

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-8">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted">
          {t("intro")}
        </p>
      </header>

      {(billingResult === "changed" || billingResult === "kept") && (
        <p
          role="status"
          className="mb-4 rounded-control bg-primary-light px-3.5 py-2.5 text-sm text-ink"
        >
          {billingResult === "kept" ? t("kept") : t("changed")}
        </p>
      )}
      {(billingResult === "changed" || billingResult === "kept") && <AutoRefresh />}
      {billingResult === "error" && (
        <p
          role="alert"
          className="mb-4 rounded-control bg-danger-light px-3.5 py-2.5 text-sm text-danger"
        >
          {t("error", { email: SUPPORT_EMAIL })}
          {typeof detail === "string" && detail && (
            <span className="mt-1 block text-xs opacity-80">
              {t("errorDetails", { detail })}
            </span>
          )}
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = usage?.planName === plan.name;
          return (
            <li
              key={plan.id}
              className={`flex flex-col rounded-card border p-6 ${
                isCurrent ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-ink">{plan.name}</h2>
                {isCurrent && (
                  <span className="rounded-md bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">
                    {t("currentPlan")}
                  </span>
                )}
              </div>
              <p className="mt-4">
                <span className="font-display text-3xl font-semibold text-ink">
                  {formatUsd(plan.monthlyPriceUsd)}
                </span>
                {plan.monthlyPriceUsd > 0 && <span className="text-sm text-muted"> {t("perMonth")}</span>}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-graphite">
                <li className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {plan.conversationQuota === null
                    ? t("unlimitedConversations")
                    : plan.conversationQuota === 0
                      ? t("noConversations")
                      : t("conversationsPerMonth", { count: plan.conversationQuota })}
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {t("unlimitedReplies")}
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {t("fullDiscovery")}
                </li>
              </ul>
              {isCurrent ? (
                billing.pendingChange ? (
                  <div className="mt-6">
                    <p className="text-sm text-graphite">
                      {t("pendingChange", {
                        next: billing.pendingChange.planName,
                        date: formatShortDate(billing.pendingChange.effectiveOn, locale),
                        plan: plan.name,
                      })}
                    </p>
                    <form action={keepCurrentPlan} className="mt-3 flex flex-col">
                      <SubmitButton
                        pendingLabel={t("saving")}
                        className={buttonClass({ variant: "secondary" })}
                      >
                        {t("keep", { plan: plan.name })}
                      </SubmitButton>
                    </form>
                  </div>
                ) : (
                  <span
                    aria-disabled="true"
                    className={buttonClass({
                      variant: "secondary",
                      className: "pointer-events-none mt-6",
                    })}
                  >
                    {t("yourPlan")}
                  </span>
                )
              ) : billing.pendingChange?.planName === plan.name ? (
                <span
                  aria-disabled="true"
                  className={buttonClass({
                    variant: "secondary",
                    className: "pointer-events-none mt-6",
                  })}
                >
                  {t("starts", { date: formatShortDate(billing.pendingChange.effectiveOn, locale) })}
                </span>
              ) : billing.enabled ? (
                <ChangePlanButton
                  planId={plan.id}
                  planName={plan.name}
                  primary={plan.monthlyPriceUsd > currentPrice}
                  note={changeNote(plan)}
                />
              ) : (
                <a
                  href={requestHref(plan.name)}
                  className={buttonClass({
                    variant: plan.monthlyPriceUsd > 0 ? "primary" : "secondary",
                    className: "mt-6",
                  })}
                >
                  {t("request", { plan: plan.name })}
                </a>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-muted">
        {billing.enabled
          ? t("footerEnabled", { email: SUPPORT_EMAIL })
          : t("footerManual", { email: SUPPORT_EMAIL })}
        {usage &&
          !usage.isFree &&
          ` ${t("periodEnds", { date: formatShortDate(usage.periodEnd, locale) })}`}
      </p>
    </PageContainer>
  );
}
