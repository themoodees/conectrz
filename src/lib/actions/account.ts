"use server";

import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { mockCompanyAccount } from "@/mocks/account";

export interface SettingsFormState {
  error?: string;
  success?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Updates the signed-in company's name and contact email. */
export async function updateCompanyDetails(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  if (!name) return { error: "Enter your company name." };
  if (!EMAIL_PATTERN.test(contactEmail)) return { error: "Enter a valid contact email." };

  if (isMockMode) {
    mockCompanyAccount.companyName = name;
    mockCompanyAccount.contactEmail = contactEmail;
  } else {
    const { supabase, user } = await requireSupabaseUser();
    const { error } = await supabase
      .from("company_profiles")
      .update({ name, contact_email: contactEmail, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return { error: "Couldn't save your changes. Please try again." };
  }

  revalidatePath("/", "layout");
  return { success: "Saved." };
}

/** Changes the signed-in user's password (any account type). */
export async function changePassword(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The passwords don't match." };
  if (isMockMode) return { success: "Password updated." };

  const { supabase } = await requireSupabaseUser();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: "Password updated." };
}
