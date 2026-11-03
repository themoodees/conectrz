"use server";

import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { mockStore } from "@/mocks/store";

/** Marks one notification as read (RLS limits updates to the user's own rows). */
export async function markNotificationRead(id: string) {
  if (isMockMode) {
    if (!mockStore.readNotificationIds.includes(id)) mockStore.readNotificationIds.push(id);
  } else {
    const { supabase, user } = await requireSupabaseUser();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .is("read_at", null);
  }
  revalidatePath("/", "layout");
}

/** Marks everything listed in the bell as read. */
export async function markAllNotificationsRead(ids: string[]) {
  if (isMockMode) {
    mockStore.readNotificationIds.push(...ids.filter((id) => !mockStore.readNotificationIds.includes(id)));
  } else {
    const { supabase, user } = await requireSupabaseUser();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
  }
  revalidatePath("/", "layout");
}
