import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonClass } from "@/components/ui/buttonStyles";
import { CheckIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL } from "@/lib/config";
import { getCurrentCompanyAccount } from "@/lib/data/account";
import { getBillingStatus } from "@/lib/data/billing";
import { getConversationUsage } from "@/lib/data/messages";
import { keepCurrentPlan } from "@/lib/actions/billing";
import { ChangePlanButton } from "@/components/plans/ChangePlanButton";
import { getPlans } from "@/lib/data/plans";
import { formatUsd, formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Plans" };

/**
 * With Stripe configured (or in mock mode), companies change plans here themselves:
 * upgrades start immediately, downgrades and Free start when the current period ends.
 * Without Stripe, "Request" opens an email and an admin switches the plan.
 */
export default async function PlansPage({ searchParams }: PageProps<"/plans">) {
  const { billing: billingResult } = await searchParams;
  const [plans, usage, account, billing] = await Promise.all([
    getPlans(),
    getConversationUsage(),
    getCurrentCompanyAccount(),
    getBillingStatus(),
  ]);
  const current = plans.find((plan) => plan.name === usage?.planName);
  const currentPrice = current?.monthlyPriceUsd ?? 0;
  const periodEnd = usage ? formatShortDate(usage.periodEnd) : "";

  /** What will happen if the company changes to this plan (shown before confirming). */
  const changeNote = (plan: (typeof plans)[number]) => {
    if (plan.monthlyPriceUsd > currentPrice) {
      return currentPrice > 0
        ? `Switches to ${plan.name} immediately. You pay the price difference for the rest of this billing period (until ${periodEnd}).`
        : `You'll enter your card on Stripe's secure page, and ${plan.name} starts right away.`;
    }
    return `You keep ${current?.name ?? "your plan"} until ${periodEnd}. Then you move to ${plan.name}.`;
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
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">Plans</h1>
        <p className="mt-2 max-w-xl text-base text-muted">
          Browse creators for free, then choose a plan to start new conversations. Replies are
          always unlimited.
        </p>
      </header>

      {(billingResult === "changed" || billingResult === "kept") && (
        <p
          role="status"
          className="mb-4 rounded-control bg-primary-light px-3.5 py-2.5 text-sm text-ink"
        >
          {billingResult === "kept"
            ? "Done. You'll keep your current plan."
            : "Done. Your plan change is being applied; refresh this page in a moment if it still shows the old plan."}
        </p>
      )}
      {billingResult === "error" && (
        <p
          role="alert"
          className="mb-4 rounded-control bg-danger-light px-3.5 py-2.5 text-sm text-danger"
        >
          Something went wrong starting the payment. Please try again, or email {SUPPORT_EMAIL}.
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
                    Current plan
                  </span>
                )}
              </div>
              <p className="mt-4">
                <span className="font-display text-3xl font-semibold text-ink">
                  {formatUsd(plan.monthlyPriceUsd)}
                </span>
                {plan.monthlyPriceUsd > 0 && <span className="text-sm text-muted"> / month</span>}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-graphite">
                <li className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {plan.conversationQuota === null
                    ? "Unlimited new conversations"
                    : plan.conversationQuota === 0
                      ? "No new conversations"
                      : `${plan.conversationQuota} new conversations per month`}
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  Unlimited replies
                </li>
                <li className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  Full creator discovery and saved lists
                </li>
              </ul>
              {isCurrent ? (
                billing.pendingChange ? (
                  <div className="mt-6">
                    <p className="text-sm text-graphite">
                      Changes to {billing.pendingChange.planName} on{" "}
                      {formatShortDate(billing.pendingChange.effectiveOn)}. You keep {plan.name}{" "}
                      until then.
                    </p>
                    <form action={keepCurrentPlan} className="mt-3 flex flex-col">
                      <button type="submit" className={buttonClass({ variant: "secondary" })}>
                        Keep {plan.name}
                      </button>
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
                    Your plan
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
                  Starts {formatShortDate(billing.pendingChange.effectiveOn)}
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
                  Request {plan.name}
                </a>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-sm text-muted">
        {billing.enabled
          ? `You can change your plan at any time. Upgrades start immediately; moving to a cheaper plan or Free starts when your current period ends. Questions? Email ${SUPPORT_EMAIL}.`
          : `Plan changes are handled by our team — requests open an email to ${SUPPORT_EMAIL}.`}
        {usage &&
          !usage.isFree &&
          ` Your current period ends on ${formatShortDate(usage.periodEnd)}.`}
      </p>
    </PageContainer>
  );
}
