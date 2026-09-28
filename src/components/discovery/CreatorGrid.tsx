import type { Creator } from "@/types/creator";
import { CreatorCard } from "./CreatorCard";

interface CreatorGridProps {
  creators: Creator[];
  savedIds: Set<string>;
  onToggleSave: (creatorId: string) => void;
}

/** 1 column on phones → 2 on large phones → 3 on tablets/laptops → 4 on wide screens. */
export function CreatorGrid({ creators, savedIds, onToggleSave }: CreatorGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {creators.map((creator) => (
        <li key={creator.id} className="flex">
          <CreatorCard
            creator={creator}
            isSaved={savedIds.has(creator.id)}
            onToggleSave={onToggleSave}
          />
        </li>
      ))}
    </ul>
  );
}
