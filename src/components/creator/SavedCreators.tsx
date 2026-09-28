"use client";

import type { Creator } from "@/types/creator";
import { CreatorGrid } from "@/components/discovery/CreatorGrid";
import { useSavedCreators } from "./useSavedCreators";

/** Grid of saved creators. Un-saving removes the card after the page refreshes. */
export function SavedCreators({ creators }: { creators: Creator[] }) {
  const { savedIds, toggleSave } = useSavedCreators(creators.map((creator) => creator.id));

  return (
    <div className="space-y-5">
      <p className="text-sm text-graphite">
        <span className="font-semibold text-ink">{creators.length}</span>{" "}
        {creators.length === 1 ? "creator" : "creators"}
      </p>
      <CreatorGrid creators={creators} savedIds={savedIds} onToggleSave={toggleSave} />
    </div>
  );
}
