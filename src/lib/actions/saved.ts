"use server";

import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { mockStore } from "@/mocks/store";

/** Saves or un-saves a creator for the signed-in company. */
export async function setCreatorSaved(creatorId: string, saved: boolean) {
  if (typeof creatorId !== "string" || creatorId.length === 0) {
    throw new Error("Invalid creator");
  }

  if (isMockMode) {
    const ids = mockStore.savedCreatorIds.filter((id) => id !== creatorId);
    mockStore.savedCreatorIds = saved ? [...ids, creatorId] : ids;
  } else {
    // company_id always comes from the session, never from the client.
    const { supabase, user } = await requireSupabaseUser();
    const { error } = saved
      ? await supabase
          .from("saved_creators")
          .upsert(
            { company_id: user.id, creator_id: creatorId },
            { onConflict: "company_id,creator_id", ignoreDuplicates: true },
          )
      : await supabase
          .from("saved_creators")
          .delete()
          .eq("company_id", user.id)
          .eq("creator_id", creatorId);
    if (error) throw new Error("Couldn't update saved creators");
  }

  revalidatePath("/saved");
}
