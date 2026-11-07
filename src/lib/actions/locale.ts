"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isEnabledLocale, LOCALE_COOKIE } from "@/i18n/config";
import { isMockMode } from "@/lib/config";
import { getSupabaseSession } from "@/lib/data/session";

/** Saves the language (cookie, plus the account when signed in) and refreshes the page. */
export async function setLocale(locale: string): Promise<void> {
  if (!isEnabledLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  if (!isMockMode) {
    const { supabase, user } = await getSupabaseSession();
    if (user) await supabase.rpc("set_my_language", { lang: locale });
  }
  revalidatePath("/", "layout");
}
