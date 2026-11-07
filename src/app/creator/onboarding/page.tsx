import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/creatorEditor/OnboardingForm";
import { Logo } from "@/components/ui/Logo";
import { getOwnCreatorSummary } from "@/lib/data/creatorAccount";
import { getSupabaseSession } from "@/lib/data/session";
import { isMockMode } from "@/lib/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.editor.onboarding");
  return { title: t("metaTitle") };
}

/** First step after creator sign-up: the basics needed to appear in Discover. */
export default async function CreatorOnboardingPage() {
  const t = await getTranslations("app.editor.onboarding");
  if (await getOwnCreatorSummary()) redirect("/creator/profile");

  let suggestedName = "";
  if (!isMockMode) {
    const { user } = await getSupabaseSession();
    const metadataName = user?.user_metadata?.display_name;
    suggestedName = typeof metadataName === "string" ? metadataName : "";
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Logo href="/creator" />
      <h1 className="mt-10 text-3xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 mb-8 text-muted">{t("intro")}</p>
      <OnboardingForm suggestedName={suggestedName} />
    </div>
  );
}
