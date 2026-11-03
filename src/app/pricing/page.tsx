import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { buttonClass } from "@/components/ui/buttonStyles";
import { CheckIcon } from "@/components/ui/icons";
import { isMockMode } from "@/lib/config";
import { getPlans } from "@/lib/data/plans";
import { getSupabaseSession } from "@/lib/data/session";
import { formatUsd } from "@/lib/format";
import type { Plan } from "@/types/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple monthly plans for brands working with creators in Japan.",
};

/** What each plan includes, based on the plan's own limits. */
function planFeatures(plan: Plan): string[] {
  const paid = plan.monthlyPriceUsd > 0;
  const features: string[] = [];

  if (plan.conversationQuota === null) features.push("Unlimited new conversations");
  else if (plan.conversationQuota === 0) features.push("Browse creators (no new conversations)");
  else features.push(`${plan.conversationQuota} new conversations per month`);

  if (plan.dailyNewConversationLimit !== null && plan.conversationQuota !== 0) {
    features.push(`Up to ${plan.dailyNewConversationLimit} new conversations per day`);
  }
  if (paid) {
    features.push("Unlimited replies");
    features.push("Creators' full names, city, social handles and links");
  } else {
    features.push("Creators' first names and audience sizes");
  }
  return features;
}

export default async function PricingPage() {
  const isSignedIn = isMockMode ? false : Boolean((await getSupabaseSession()).user);
  const plans = await getPlans();

  return (
    <>
      <MarketingHeader isSignedIn={isSignedIn} />
      <main>
        <section className="mx-auto max-w-page px-4 py-14 md:px-6 md:py-20 lg:px-8">
          <p className="text-sm font-semibold text-primary">Pricing</p>
          <h1 className="mt-2 max-w-2xl text-4xl leading-[1.1] font-semibold text-ink md:text-5xl">
            Simple monthly plans for brands
          </h1>
          <p className="mt-4 max-w-xl text-lg text-graphite">
            Pay for the conversations you start with creators. Prices are in US dollars per month.
          </p>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const paid = plan.monthlyPriceUsd > 0;
              return (
                <li
                  key={plan.id}
                  className="flex flex-col rounded-card border border-border bg-white p-6"
                >
                  <h2 className="text-xl font-semibold text-ink">{plan.name}</h2>
                  <p className="mt-4">
                    <span className="font-display text-4xl font-semibold text-ink">
                      {formatUsd(plan.monthlyPriceUsd)}
                    </span>
                    {paid && <span className="text-sm text-muted"> / month</span>}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm text-graphite">
                    {planFeatures(plan).map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={isSignedIn ? "/plans" : "/signup"}
                    className={buttonClass({
                      variant: paid ? "primary" : "secondary",
                      className: "mt-8",
                    })}
                  >
                    {isSignedIn ? "See your plan" : paid ? `Get started with ${plan.name}` : "Start free"}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 max-w-2xl text-sm text-muted">
            New conversation allowances renew on your billing date and don&apos;t roll over. Plan
            changes are handled by our team for now.
          </p>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
