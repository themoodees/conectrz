"use server";

import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("app.accountErrors");
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  if (!name) return { error: t("companyName") };
  if (!EMAIL_PATTERN.test(contactEmail)) return { error: t("contactEmail") };

  if (isMockMode) {
    mockCompanyAccount.companyName = name;
    mockCompanyAccount.contactEmail = contactEmail;
  } else {
    const { supabase, user } = await requireSupabaseUser();
    const { error } = await supabase
      .from("company_profiles")
      .update({ name, contact_email: contactEmail, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return { error: t("saveFailed") };
  }

  revalidatePath("/", "layout");
  return { success: t("saved") };
}

/** Changes the signed-in user's password (any account type). */
export async function changePassword(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const t = await getTranslations("app.accountErrors");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: t("passwordShort") };
  if (password !== confirm) return { error: t("passwordMismatch") };
  if (isMockMode) return { success: t("passwordUpdated") };

  const { supabase } = await requireSupabaseUser();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: t("passwordUpdated") };
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
  const t = await getTranslations("app.accountErrors");
  if (String(formData.get("confirm") ?? "").trim() !== "DELETE") {
    return { error: t("typeDelete") };
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

  // Take them off the marketing list while we still know their email.
  try {
    await supabase.functions.invoke("marketing-contact", { body: { mode: "remove" } });
  } catch {
    // best effort
  }

  const { error } = await supabase.rpc("delete_my_creator_account");
  if (error) return { error: t("deleteFailed") };

  const server = await createSupabaseServerClient();
  await server.auth.signOut();
  redirect("/login?deleted=1");
}
