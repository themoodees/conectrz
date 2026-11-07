import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { TrackOnMount } from "@/components/analytics/TrackOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  CompanyDetailsForm,
  PasswordForm,
  SettingsSection,
} from "@/components/settings/SettingsForms";
import { buttonClass } from "@/components/ui/buttonStyles";
import { RatingSummary } from "@/components/creator/RatingSummary";
import { ReviewList } from "@/components/creator/ReviewsSection";
import { getCurrentCompanyAccount } from "@/lib/data/account";
import { getMyCompanyReviews } from "@/lib/data/companies";
import { AutoRefresh } from "@/components/plans/AutoRefresh";
import { openBillingPortal } from "@/lib/actions/billing";
import { getBillingStatus } from "@/lib/data/billing";
import { getConversationUsage } from "@/lib/data/messages";
import { formatShortDate } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.companySettings");
  return { title: t("title") };
}

export default async function SettingsPage({ searchParams }: PageProps<"/settings">) {
  const t = await getTranslations("app.settings");
  const tc = await getTranslations("app.companySettings");
  const locale = await getLocale();
  const [account, usage, billing, reviews, { billing: billingResult }] = await Promise.all([
    getCurrentCompanyAccount(),
    getConversationUsage(),
    getBillingStatus(),
    getMyCompanyReviews(),
    searchParams,
  ]);
  if (!account) return null;

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {tc("title")}
        </h1>
      </header>

      <div className="max-w-3xl space-y-5">
        <SettingsSection
          title={tc("planTitle")}
          description={tc("planDescription")}
        >
          {billingResult === "success" && (
            <p
              role="status"
              className="mb-4 rounded-control bg-primary-light px-3.5 py-2.5 text-sm text-ink"
            >
              {tc("paymentThanks")}
            </p>
          )}
          {billingResult === "success" && <AutoRefresh times={12} />}
          {billingResult === "success" && <TrackOnMount event="subscription_started" />}
          {billingResult === "error" && (
            <p
              role="alert"
              className="mb-4 rounded-control bg-danger-light px-3.5 py-2.5 text-sm text-danger"
            >
              {tc("billingError")}
            </p>
          )}
          {usage ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{usage.planName}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {usage.isFree
                    ? tc("usageFree")
                    : usage.quota === null
                      ? tc("usageUnlimited", {
                          used: usage.used,
                          date: formatShortDate(usage.periodEnd, locale),
                        })
                      : tc("usageQuota", {
                          used: usage.used,
                          quota: usage.quota,
                          date: formatShortDate(usage.periodEnd, locale),
                        })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {billing.hasCustomer && (
                  <form action={openBillingPortal}>
                    <button type="submit" className={buttonClass({ size: "sm" })}>
                      {tc("manageBilling")}
                    </button>
                  </form>
                )}
                <Link href="/plans" className={buttonClass({ variant: "secondary", size: "sm" })}>
                  {tc("viewPlans")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted">{tc("noPlan")}</p>
              <Link href="/plans" className={buttonClass({ size: "sm" })}>
                {tc("viewPlans")}
              </Link>
            </div>
          )}
        </SettingsSection>

        <SettingsSection title={tc("detailsTitle")}>
          <CompanyDetailsForm name={account.companyName} contactEmail={account.contactEmail} />
        </SettingsSection>

        <SettingsSection
          title={tc("reviewsTitle")}
          description={tc("reviewsDescription")}
        >
          {reviews.length > 0 && (
            <p className="mb-4">
              <RatingSummary
                average={reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length}
                count={reviews.length}
              />
            </p>
          )}
          <ReviewList reviews={reviews.map((r) => ({ ...r, name: r.creatorName }))} />
        </SettingsSection>

        <SettingsSection title={t("title")} description={t("description")}>
          <LanguageSwitcher />
        </SettingsSection>

        <SettingsSection title={tc("passwordTitle")}>
          <PasswordForm />
        </SettingsSection>
      </div>
    </PageContainer>
  );
}
