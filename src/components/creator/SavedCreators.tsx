"use client";

import { useTranslations } from "next-intl";
import type { Creator } from "@/types/creator";
import { CreatorGrid } from "@/components/discovery/CreatorGrid";
import { useSavedCreators } from "./useSavedCreators";

/** Grid of saved creators. Un-saving removes the card after the page refreshes. */
export function SavedCreators({ creators }: { creators: Creator[] }) {
  const t = useTranslations("app.discovery");
  const { savedIds, toggleSave } = useSavedCreators(creators.map((creator) => creator.id));

  return (
    <div className="space-y-5">
      <p className="text-sm text-graphite">
        {t.rich("count", {
          count: creators.length,
          b: (chunks) => <span className="font-semibold text-ink">{chunks}</span>,
        })}
      </p>
      <CreatorGrid creators={creators} savedIds={savedIds} onToggleSave={toggleSave} />
    </div>
  );
}
