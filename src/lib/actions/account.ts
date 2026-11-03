"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

/**
 * Deletes the signed-in creator's account: removes their uploaded files, then the database
 * function erases personal details and closes the login while keeping conversation history
 * (shown as "Deleted creator"). The person must type DELETE to confirm.
 */
export async function deleteCreatorAccount(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  if (String(formData.get("confirm") ?? "").trim() !== "DELETE") {
    return { error: "Type DELETE to confirm." };
  }
  if (isMockMode) redirect("/login");

  const { supabase, user } = await requireSupabaseUser();

  // Uploaded files live under a folder named after the user id in both buckets.
  for (const bucket of ["creator-photos", "portfolio"]) {
    const { data: files } = await supabase.storage.from(bucket).list(user.id, { limit: 1000 });
    if (files?.length) {
      await supabase.storage.from(bucket).remove(files.map((f) => `${user.id}/${f.name}`));
    }
  }

  const { error } = await supabase.rpc("delete_my_creator_account");
  if (error) return { error: "We couldn't delete your account. Please try again or contact support." };

  const server = await createSupabaseServerClient();
  await server.auth.signOut();
  redirect("/login?deleted=1");
}
