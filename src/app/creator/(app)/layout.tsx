import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { getOwnCreatorSummary } from "@/lib/data/creatorAccount";

/** Header + nav for onboarded creators. New creators are sent to onboarding first. */
export default async function CreatorAppLayout({ children }: { children: React.ReactNode }) {
  const creator = await getOwnCreatorSummary();
  if (!creator) redirect("/creator/onboarding");

  return (
    <>
      <AppHeader area="creator" areaLabel="Creator" account={{ name: creator.displayName }} />
      <main>{children}</main>
    </>
  );
}
