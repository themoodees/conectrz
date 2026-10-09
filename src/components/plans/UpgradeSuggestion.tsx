import Link from "next/link";
import type { Plan } from "@/types/plans";
import { formatJpy } from "@/lib/format";
import { buttonClass } from "@/components/ui/buttonStyles";

/**
 * Shown when a company has used its conversations: suggests the paid plans.
 * Copy is written for Free (one-time allowance) but also works for paid plans.
 */
export function UpgradeSuggestion({
  isFree,
  quota,
  plans,
}: {
  isFree: boolean;
  quota: number;
  plans: Plan[];
}) {
  return (
    <div className="mt-3 max-w-md rounded-card border border-border p-4">
      <p className="text-sm font-semibold text-ink">
        {isFree
          ? `You've used your ${quota === 1 ? "free conversation" : `${quota} free conversations`}`
          : "You've reached this period's limit"}
      </p>
      <p className="mt-1 text-sm text-graphite">
        {isFree
          ? "Upgrade to keep contacting creators every month."
          : "Upgrade for more conversations, or wait for your plan to renew."}
      </p>
      {plans.length > 0 && (
        <ul className="mt-3 space-y-2">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="flex items-baseline justify-between gap-3 rounded-control bg-surface px-3 py-2 text-sm"
            >
              <span className="font-medium text-ink">{plan.name}</span>
              <span className="text-graphite">
                {plan.conversationQuota} conversations / month ·{" "}
                <span className="font-semibold text-ink">{formatJpy(plan.monthlyPriceJpy)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/plans" className={buttonClass({ size: "sm", className: "mt-4" })}>
        See plans
      </Link>
    </div>
  );
}
