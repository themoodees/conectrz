import "server-only";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLocale } from "next-intl/server";
import { isEnabledLocale, LOCALE_COOKIE } from "@/i18n/config";
import type { Database } from "@/lib/supabase/database.types";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Called right after someone signs in. If their account already has a language, it wins (so
 * the site looks the same on every device). Otherwise the language they have been browsing
 * in becomes their account language.
 */
export async function syncLocaleOnSignIn(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { data } = await supabase
    .from("profiles")
    .select("preferred_language")
    .eq("id", userId)
    .maybeSingle();

  const saved = data?.preferred_language;
  if (isEnabledLocale(saved)) {
    (await cookies()).set(LOCALE_COOKIE, saved, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  } else {
    await supabase.rpc("set_my_language", { lang: await getLocale() });
  }
}
