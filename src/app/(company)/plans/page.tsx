import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { buttonClass } from "@/components/ui/buttonStyles";
import { CheckIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL } from "@/lib/config";
import { getCurrentCompanyAccount } from "@/lib/data/account";
import { getConversationUsage } from "@/lib/data/messages";
import { getPlans } from "@/lib/data/plans";
import { formatJpy, formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Plans" };

/**
 * Plans are upgraded manually for now: "Request" opens an email to the team,
 * and an admin switches the plan in the admin panel.
 */
export default async function PlansPage() {
  const [plans, usage, account] = await Promise.all([
    getPlans(),
    getConversationUsage(),
    getCurrentCompanyAccount(),
  ]);

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
          Plans set how many new conversations you can start each month. Replies are always
          unlimited.
        </p>
      </header>

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
                  {formatJpy(plan.monthlyPriceJpy)}
                </span>
                <span className="text-sm text-muted"> / month</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-graphite">
                <li className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {plan.conversationQuota} new{" "}
                  {plan.conversationQuota === 1 ? "conversation" : "conversations"} per month
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
                <span
                  aria-disabled="true"
                  className={buttonClass({ variant: "secondary", className: "pointer-events-none mt-6" })}
                >
                  Your plan
                </span>
              ) : (
                <a
                  href={requestHref(plan.name)}
                  className={buttonClass({
                    variant: plan.monthlyPriceJpy > 0 ? "primary" : "secondary",
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
        Plan changes are handled by our team — requests open an email to {SUPPORT_EMAIL}.
        {usage && ` Your current period ends on ${formatShortDate(usage.periodEnd)}.`}
      </p>
    </PageContainer>
  );
}
