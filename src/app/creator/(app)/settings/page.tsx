import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  DeleteAccountForm,
  PasswordForm,
  SettingsSection,
} from "@/components/settings/SettingsForms";

export const metadata: Metadata = { title: "Account settings" };

const SECTIONS = [
  { id: "password", label: "Password" },
  { id: "delete", label: "Delete account" },
] as const;

export default async function CreatorSettingsPage({
  searchParams,
}: PageProps<"/creator/settings">) {
  const { section } = await searchParams;
  const active = SECTIONS.find((s) => s.id === section)?.id ?? "password";

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          Account settings
        </h1>
      </header>
      <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
        <nav aria-label="Settings sections" className="flex gap-2 md:flex-col">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={`/creator/settings?section=${s.id}`}
              aria-current={s.id === active ? "page" : undefined}
              className={`rounded-card px-3 py-2 text-sm font-medium ${
                s.id === active ? "bg-primary-light text-primary" : "text-muted hover:text-ink"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <div className="max-w-3xl">
          {active === "password" ? (
            <SettingsSection title="Password">
              <PasswordForm />
            </SettingsSection>
          ) : (
            <SettingsSection
              title="Delete account"
              description="Permanently close your Conectrz creator account."
            >
              <DeleteAccountForm />
            </SettingsSection>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
