import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PasswordForm, SettingsSection } from "@/components/settings/SettingsForms";

export const metadata: Metadata = { title: "Account settings" };

export default function CreatorSettingsPage() {
  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          Account settings
        </h1>
      </header>
      <div className="max-w-3xl space-y-5">
        <SettingsSection title="Password">
          <PasswordForm />
        </SettingsSection>
      </div>
    </PageContainer>
  );
}
