"use client";

import { useState, useTransition } from "react";
import { setCreatorSaved } from "@/lib/actions/saved";

/**
 * Saved-creator state with optimistic updates: the UI changes immediately,
 * then the change is stored (Supabase `saved_creators`, or the mock store).
 * If storing fails, the change is rolled back.
 */
export function useSavedCreators(initialSavedIds: string[]) {
  const [savedIds, setSavedIds] = useState(() => new Set(initialSavedIds));
  const [, startTransition] = useTransition();

  const update = (creatorId: string, saved: boolean) =>
    setSavedIds((current) => {
      const next = new Set(current);
      if (saved) next.add(creatorId);
      else next.delete(creatorId);
      return next;
    });

  const toggleSave = (creatorId: string) => {
    const willSave = !savedIds.has(creatorId);
    update(creatorId, willSave);
    startTransition(async () => {
      try {
        await setCreatorSaved(creatorId, willSave);
      } catch {
        update(creatorId, !willSave);
      }
    });
  };

  return { savedIds, toggleSave };
}
