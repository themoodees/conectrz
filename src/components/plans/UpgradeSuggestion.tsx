import Link from "next/link";
import type { Plan } from "@/types/plans";
import { formatUsd } from "@/lib/format";
import { buttonClass } from "@/components/ui/buttonStyles";

/**
 * Shown when a company can't start more conversations: suggests the paid plans.
 * Free has no conversations at all; paid plans run out per billing period.
 */
export function UpgradeSuggestion({
  isFree,
  plans,
}: {
  isFree: boolean;
  plans: Plan[];
}) {
  return (
    <div className="mt-3 max-w-md rounded-card border border-border p-4">
      <p className="text-sm font-semibold text-ink">
        {isFree
          ? "The Free plan can't start conversations"
          : "You've reached this period's limit"}
      </p>
      <p className="mt-1 text-sm text-graphite">
        {isFree
          ? "Upgrade to contact creators and start new conversations."
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
                {plan.conversationQuota === null
                  ? "Unlimited conversations"
                  : `${plan.conversationQuota} conversations / month`}{" "}
                ·{" "}
                <span className="font-semibold text-ink">{formatUsd(plan.monthlyPriceUsd)}</span>
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
