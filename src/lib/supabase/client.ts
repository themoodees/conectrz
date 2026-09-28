import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "@/lib/config";
import type { Database } from "./database.types";

/** Supabase client for the browser (used for direct file uploads). */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey);
}
