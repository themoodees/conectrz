import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { BasicsForm } from "@/components/creatorEditor/BasicsForm";
import { EditorSection } from "@/components/creatorEditor/EditorSection";
import { LanguagesEditor } from "@/components/creatorEditor/LanguagesEditor";
import { NichesEditor } from "@/components/creatorEditor/NichesEditor";
import { PhotoUploader } from "@/components/creatorEditor/PhotoUploader";
import { PortfolioEditor } from "@/components/creatorEditor/PortfolioEditor";
import { ServicesEditor } from "@/components/creatorEditor/ServicesEditor";
import { SocialAccountsEditor } from "@/components/creatorEditor/SocialAccountsEditor";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { getEditorOptions, getOwnCreatorEditorData } from "@/lib/data/creatorAccount";

export const metadata: Metadata = { title: "My profile" };

/** Creator profile editor. Each section saves on its own. */
export default async function CreatorProfileEditorPage({
  searchParams,
}: PageProps<"/creator/profile">) {
  const [data, options, { welcome }] = await Promise.all([
    getOwnCreatorEditorData(),
    getEditorOptions(),
    searchParams,
  ]);
  if (!data) return null;

  return (
    <PageContainer>
      <header className="flex flex-wrap items-end justify-between gap-4 pt-7 pb-6 md:pt-10 md:pb-7">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
            My profile
          </h1>
          <p className="mt-2 text-base text-muted">This is what brands see when they find you.</p>
        </div>
        <Link href="/creator/profile/preview" className={buttonClass({ variant: "secondary" })}>
          Preview profile
        </Link>
      </header>

      {welcome && (
        <div className="mb-5 max-w-3xl">
          <FormMessage tone="success">
            Your profile is live. Add a photo, services and portfolio work so brands can understand
            what you offer.
          </FormMessage>
        </div>
      )}

      <div className="max-w-3xl space-y-5">
        <EditorSection title="Photo">
          <PhotoUploader creatorId={data.id} name={data.displayName} photoUrl={data.photoUrl} />
        </EditorSection>
        <EditorSection title="Basics">
          <BasicsForm data={data} />
        </EditorSection>
        <EditorSection title="Niches" description="The topics you create content about.">
          <NichesEditor options={options.niches} initialIds={data.nicheIds} />
        </EditorSection>
        <EditorSection title="Languages">
          <LanguagesEditor options={options.languages} initialRows={data.languages} />
        </EditorSection>
        <EditorSection
          title="Services & rates"
          description="What brands can book you for. Rates are in yen."
        >
          <ServicesEditor options={options.services} initialRows={data.services} />
        </EditorSection>
        <EditorSection
          title="Social accounts"
          description="Follower counts are optional — leave them empty if you mainly create UGC."
        >
          <SocialAccountsEditor initialRows={data.socialAccounts} />
        </EditorSection>
        <EditorSection title="Portfolio" description="Examples of your best work.">
          <PortfolioEditor creatorId={data.id} items={data.portfolio} />
        </EditorSection>
      </div>
    </PageContainer>
  );
}
