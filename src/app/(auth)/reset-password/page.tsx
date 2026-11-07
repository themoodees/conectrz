import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.reset");
  return { title: t("metaTitle") };
}

/** Reached from the reset email (via /auth/confirm, which signs the user in). */
export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.reset");
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 mb-8 text-muted">{t("subtitle")}</p>
      <ResetPasswordForm />
    </>
  );
}
