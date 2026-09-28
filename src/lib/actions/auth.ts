"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isMockMode } from "@/lib/config";
import { ensureCompanyProfile } from "@/lib/data/account";
import { HOME_PATHS } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
  /** Shown after sign-up when the email needs confirming. */
  notice?: string;
  /** Echo back typed values so fields keep them after an error. */
  values?: Record<string, string>;
}

const MIN_PASSWORD_LENGTH = 8;

/** Only allow redirects to paths inside this app. /home picks the area by account type. */
function safeNextPath(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/home";
}

export async function logIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password.", values: { email } };
  }
  if (isMockMode) redirect(next === "/home" ? HOME_PATHS.company : next);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: "That email and password don't match.", values: { email } };
  }

  // No-op for creators/admins; finishes company setup if confirmation happened elsewhere.
  await ensureCompanyProfile(supabase, data.user);
  redirect(next);
}

/**
 * Sign-up for both account types. The hidden "role" field decides which.
 * Companies get their company profile right away; creators finish onboarding next.
 */
export async function signUp(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const role = formData.get("role") === "creator" ? "creator" : "company";
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  if (!name || !email || !password) {
    return { error: "Fill in all fields.", values };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`, values };
  }
  if (isMockMode) redirect(HOME_PATHS[role]);

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // "role" is read by the on_auth_user_created trigger (only company/creator are accepted).
      data:
        role === "company"
          ? { role, company_name: name }
          : { role, display_name: name },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Sign-up failed. Please try again.", values };
  }

  // With email confirmation on, there's no session until the link is clicked.
  if (!data.session) {
    return { notice: `We sent a confirmation link to ${email}. Open it to finish signing up.` };
  }

  if (role === "company") await ensureCompanyProfile(supabase, data.user);
  redirect(HOME_PATHS[role]);
}

export async function signOut() {
  if (!isMockMode) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
