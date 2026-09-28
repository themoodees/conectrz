import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  CompanyDetailsForm,
  PasswordForm,
  SettingsSection,
} from "@/components/settings/SettingsForms";
import { buttonClass } from "@/components/ui/buttonStyles";
import { getCurrentCompanyAccount } from "@/lib/data/account";
import { getConversationUsage } from "@/lib/data/messages";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage() {
  const [account, usage] = await Promise.all([getCurrentCompanyAccount(), getConversationUsage()]);
  if (!account) return null;

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          Account settings
        </h1>
      </header>

      <div className="max-w-3xl space-y-5">
        <SettingsSection
          title="Plan"
          description="Your plan sets how many new conversations you can start each period."
        >
          {usage ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{usage.planName}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {usage.used} of {usage.quota} conversations used · renews{" "}
                  {formatShortDate(usage.periodEnd)}
                </p>
              </div>
              <Link href="/plans" className={buttonClass({ variant: "secondary", size: "sm" })}>
                View plans
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted">You don&apos;t have an active plan.</p>
              <Link href="/plans" className={buttonClass({ size: "sm" })}>
                View plans
              </Link>
            </div>
          )}
        </SettingsSection>

        <SettingsSection title="Company details">
          <CompanyDetailsForm name={account.companyName} contactEmail={account.contactEmail} />
        </SettingsSection>

        <SettingsSection title="Password">
          <PasswordForm />
        </SettingsSection>
      </div>
    </PageContainer>
  );
}
