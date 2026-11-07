import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BriefcaseIcon, UploadIcon } from "@/components/ui/icons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.choice");
  return { title: t("metaTitle") };
}

const CHOICES = [
  { href: "/signup/company", icon: BriefcaseIcon, key: "brand" },
  { href: "/signup/creator", icon: UploadIcon, key: "creator" },
] as const;

export default async function SignupChoicePage() {
  const t = await getTranslations("auth.choice");
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 mb-8 text-muted">{t("subtitle")}</p>

      <div className="space-y-3">
        {CHOICES.map(({ href, icon: Icon, key }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-card border border-border p-5 transition-colors hover:border-primary hover:bg-primary-light"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold text-ink">{t(`${key}Title`)}</span>
              <span className="block text-sm text-muted">{t(`${key}Text`)}</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
          {t("signIn")}
        </Link>
      </p>
    </>
  );
}
