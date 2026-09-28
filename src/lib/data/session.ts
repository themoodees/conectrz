import "server-only";
import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * The signed-in Supabase user + a client that acts as them (RLS applies).
 * Cached per request so pages and layouts share one lookup.
 */
export const getSupabaseSession = cache(
  async (): Promise<{ supabase: SupabaseClient<Database>; user: User | null }> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  },
);

/** Like getSupabaseSession, but throws when nobody is signed in. */
export async function requireSupabaseUser() {
  const { supabase, user } = await getSupabaseSession();
  if (!user) throw new Error("Not signed in");
  return { supabase, user };
}
