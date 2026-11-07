import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { BasicsForm } from "@/components/creatorEditor/BasicsForm";
import { EditorSection } from "@/components/creatorEditor/EditorSection";
import { LanguagesEditor } from "@/components/creatorEditor/LanguagesEditor";
import { NichesEditor } from "@/components/creatorEditor/NichesEditor";
import { PaymentMethodsEditor } from "@/components/creatorEditor/PaymentMethodsEditor";
import { PhotoUploader } from "@/components/creatorEditor/PhotoUploader";
import { PortfolioEditor } from "@/components/creatorEditor/PortfolioEditor";
import { ServicesEditor } from "@/components/creatorEditor/ServicesEditor";
import { SocialAccountsEditor } from "@/components/creatorEditor/SocialAccountsEditor";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { getEditorOptions, getOwnCreatorEditorData } from "@/lib/data/creatorAccount";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.profilePage");
  return { title: t("title") };
}

/** Creator profile editor. Each section saves on its own. */
export default async function CreatorProfileEditorPage({
  searchParams,
}: PageProps<"/creator/profile">) {
  const t = await getTranslations("app.profilePage");
  const [data, options, { welcome }] = await Promise.all([
    getOwnCreatorEditorData(),
    getEditorOptions(),
    searchParams,
  ]);
  if (!data) return null;

  // Brands only find creators who have these three things (and an active account).
  const missing = [
    !data.prefecture && t("missingPrefecture"),
    data.languages.length === 0 && t("missingLanguage"),
    data.services.length === 0 && t("missingService"),
  ].filter((item): item is string => Boolean(item));
  const isLive = data.status === "active" && missing.length === 0;

  return (
    <PageContainer>
      <header className="flex flex-wrap items-end justify-between gap-4 pt-7 pb-6 md:pt-10 md:pb-7">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-base text-muted">{t("intro")}</p>
        </div>
        <Link href="/creator/profile/preview" className={buttonClass({ variant: "secondary" })}>
          {t("preview")}
        </Link>
      </header>

      {data.status === "active" && missing.length > 0 && (
        <p
          role="status"
          className="mb-5 max-w-3xl rounded-control bg-primary-light px-3.5 py-2.5 text-sm text-ink"
        >
          <span className="font-semibold">{t("notFoundTitle")}</span>{" "}
          {t("notFoundText", { missing: missing.join(t("separator")) })}
        </p>
      )}
      {welcome && isLive && (
        <div className="mb-5 max-w-3xl">
          <FormMessage tone="success">{t("live")}</FormMessage>
        </div>
      )}

      <div className="max-w-3xl space-y-5">
        <EditorSection title={t("sections.photo")}>
          <PhotoUploader creatorId={data.id} name={data.displayName} photoUrl={data.photoUrl} />
        </EditorSection>
        <EditorSection title={t("sections.basics")}>
          <BasicsForm data={data} />
        </EditorSection>
        <EditorSection title={t("sections.niches")} description={t("sections.nichesDesc")}>
          <NichesEditor options={options.niches} initialIds={data.nicheIds} />
        </EditorSection>
        <EditorSection title={t("sections.languages")}>
          <LanguagesEditor options={options.languages} initialRows={data.languages} />
        </EditorSection>
        <EditorSection title={t("sections.services")} description={t("sections.servicesDesc")}>
          <ServicesEditor options={options.services} initialRows={data.services} />
        </EditorSection>
        <EditorSection title={t("sections.social")} description={t("sections.socialDesc")}>
          <SocialAccountsEditor initialRows={data.socialAccounts} />
        </EditorSection>
        <EditorSection title={t("sections.payments")} description={t("sections.paymentsDesc")}>
          <PaymentMethodsEditor initial={data.paymentMethods} />
        </EditorSection>
        <EditorSection title={t("sections.portfolio")} description={t("sections.portfolioDesc")}>
          <PortfolioEditor creatorId={data.id} items={data.portfolio} />
        </EditorSection>
      </div>
    </PageContainer>
  );
}
