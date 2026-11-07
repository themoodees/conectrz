import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SignupForm } from "@/components/auth/SignupForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signup");
  return { title: t("companyMetaTitle") };
}

export default async function CompanySignupPage() {
  const t = await getTranslations("auth.signup");
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">{t("companyTitle")}</h1>
      <p className="mt-2 mb-8 text-muted">{t("companySubtitle")}</p>
      <SignupForm role="company" />
    </>
  );
}
