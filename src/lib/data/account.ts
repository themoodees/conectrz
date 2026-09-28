import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { CompanyAccount } from "@/types/account";
import type { Database } from "@/lib/supabase/database.types";
import { isMockMode } from "@/lib/config";
import { mockCompanyAccount } from "@/mocks/account";
import { getSupabaseSession } from "./session";

/**
 * The signed-in Company, or null when nobody is signed in
 * or the user isn't a company (e.g. a creator account).
 */
export async function getCurrentCompanyAccount(): Promise<CompanyAccount | null> {
  if (isMockMode) return mockCompanyAccount;

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;

  const { data, error } = await supabase
    .from("company_profiles")
    .select("id, name, contact_email, status")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    companyName: data.name,
    contactEmail: data.contact_email,
    status: data.status,
  };
}

/**
 * Creates the company_profiles row for a new company user if it doesn't exist yet.
 * (The profiles row itself is created by the `on_auth_user_created` trigger.)
 * Uses the company name given at sign-up, stored in the user's metadata.
 */
export async function ensureCompanyProfile(
  supabase: SupabaseClient<Database>,
  user: User,
) {
  const { data: existing } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "company") return;

  const companyName =
    typeof user.user_metadata?.company_name === "string"
      ? user.user_metadata.company_name
      : (user.email ?? "My company");

  const { error } = await supabase.from("company_profiles").insert({
    id: user.id,
    name: companyName,
    contact_email: user.email ?? "",
  });
  if (error) throw error;
}
