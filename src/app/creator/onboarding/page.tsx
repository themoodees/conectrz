import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/creatorEditor/OnboardingForm";
import { Logo } from "@/components/ui/Logo";
import { getOwnCreatorSummary } from "@/lib/data/creatorAccount";
import { getSupabaseSession } from "@/lib/data/session";
import { isMockMode } from "@/lib/config";

export const metadata: Metadata = { title: "Set up your profile" };

/** First step after creator sign-up: the basics needed to appear in Discover. */
export default async function CreatorOnboardingPage() {
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
      <h1 className="mt-10 text-3xl font-semibold text-ink">Set up your creator profile</h1>
      <p className="mt-2 mb-8 text-muted">
        Start with the basics — you can add services, social accounts and portfolio work next.
      </p>
      <OnboardingForm suggestedName={suggestedName} />
    </div>
  );
}
