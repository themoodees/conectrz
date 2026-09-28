import "server-only";
import type { Creator } from "@/types/creator";
import { isMockMode } from "@/lib/config";
import { mockStore } from "@/mocks/store";
import { getCreatorsByIds } from "./creators";
import { getSupabaseSession } from "./session";

/** Ids of creators the signed-in company has saved, newest first. */
export async function getSavedCreatorIds(): Promise<string[]> {
  if (isMockMode) return [...mockStore.savedCreatorIds].reverse();

  const { supabase, user } = await getSupabaseSession();
  if (!user) return [];

  // RLS limits this to the signed-in company's own list.
  const { data, error } = await supabase
    .from("saved_creators")
    .select("creator_id")
    .eq("company_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => row.creator_id);
}

export async function getSavedCreators(): Promise<Creator[]> {
  return getCreatorsByIds(await getSavedCreatorIds());
}
