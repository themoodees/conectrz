import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  DeleteAccountForm,
  PasswordForm,
  SettingsSection,
} from "@/components/settings/SettingsForms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.settingsForms");
  return { title: t("settingsTitle") };
}

const SECTIONS = [
  { id: "password", label: "password" },
  { id: "language", label: "language" },
  { id: "delete", label: "deleteAccount" },
] as const;

export default async function CreatorSettingsPage({
  searchParams,
}: PageProps<"/creator/settings">) {
  const t = await getTranslations("app.settings");
  const ts = await getTranslations("app.settingsForms");
  const { section } = await searchParams;
  const active = SECTIONS.find((s) => s.id === section)?.id ?? "password";

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {ts("settingsTitle")}
        </h1>
      </header>
      <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
        <nav aria-label={ts("sectionsAria")} className="flex gap-2 md:flex-col">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={`/creator/settings?section=${s.id}`}
              aria-current={s.id === active ? "page" : undefined}
              className={`rounded-card px-3 py-2 text-sm font-medium ${
                s.id === active ? "bg-primary-light text-primary" : "text-muted hover:text-ink"
              }`}
            >
              {s.id === "language" ? t("navLabel") : ts(s.label)}
            </Link>
          ))}
        </nav>
        <div className="max-w-3xl">
          {active === "password" ? (
            <SettingsSection title={ts("password")}>
              <PasswordForm />
            </SettingsSection>
          ) : active === "language" ? (
            <SettingsSection title={t("title")} description={t("description")}>
              <LanguageSwitcher />
            </SettingsSection>
          ) : (
            <SettingsSection title={ts("deleteAccount")} description={ts("deleteDesc")}>
              <DeleteAccountForm />
            </SettingsSection>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
