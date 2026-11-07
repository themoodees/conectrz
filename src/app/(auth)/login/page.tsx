import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("metaTitle") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error, deleted } = await searchParams;
  const t = await getTranslations("auth.login");

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 mb-8 text-muted">{deleted === "1" ? t("deleted") : t("subtitle")}</p>
      <LoginForm
        next={typeof next === "string" ? next : undefined}
        initialError={
          error === "confirmation"
            ? t("confirmationError")
            : error === "reset"
              ? t("resetError")
              : undefined
        }
      />
    </>
  );
}
