"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { isMockMode } from "@/lib/config";
import { ensureCompanyProfile } from "@/lib/data/account";
import { syncLocaleOnSignIn } from "@/lib/data/language";
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
  // Must start with a single "/" (not "//" or "/\", which browsers treat as another site).
  return /^\/(?![/\\])/.test(next) ? next : "/home";
}

export async function logIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));
  const t = await getTranslations("auth");

  if (!email || !password) {
    return { error: t("errors.enterCredentials"), values: { email } };
  }
  if (isMockMode) redirect(next === "/home" ? HOME_PATHS.company : next);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: t("errors.badCredentials"), values: { email } };
  }

  // No-op for creators/admins; finishes company setup if confirmation happened elsewhere.
  await ensureCompanyProfile(supabase, data.user);
  await syncLocaleOnSignIn(supabase, data.user.id);
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
  const t = await getTranslations("auth");

  if (!name || !email || !password) {
    return { error: t("errors.fillAll"), values };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: t("errors.passwordLength", { min: MIN_PASSWORD_LENGTH }), values };
  }
  if (isMockMode) redirect(HOME_PATHS[role]);

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // "role" is read by the on_auth_user_created trigger (only company/creator are accepted).
      data: role === "company" ? { role, company_name: name } : { role, display_name: name },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error || !data.user) {
    const reason = (error?.message ?? "").toLowerCase();
    const message = /weak|pwned|leak|compromised/.test(reason)
      ? t("errors.weakPassword")
      : /already|registered/.test(reason)
        ? t("errors.alreadyRegistered")
        : t("errors.signupFailed");
    return { error: message, values };
  }

  await trackEvent({ name: "signup_completed", props: { role } });

  // With email confirmation on, there's no session until the link is clicked.
  if (!data.session) {
    return { notice: t("notices.confirmationSent", { email }) };
  }

  if (role === "company") await ensureCompanyProfile(supabase, data.user);
  await syncLocaleOnSignIn(supabase, data.user.id);
  redirect(HOME_PATHS[role]);
}

export async function signOut() {
  if (!isMockMode) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

/**
 * Sends a password-reset email. Always shows the same message, so the form
 * can't be used to find out which emails have accounts.
 */
export async function requestPasswordReset(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const t = await getTranslations("auth");
  if (!email) return { error: t("errors.enterEmail") };

  const notice = t("notices.resetSent", { email });
  if (isMockMode) return { notice };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  return { notice };
}

/** Sets a new password after following the reset link (the link signs the user in). */
export async function resetPassword(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const t = await getTranslations("auth");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: t("errors.passwordLength", { min: MIN_PASSWORD_LENGTH }) };
  }
  if (password !== confirm) return { error: t("errors.mismatch") };
  if (isMockMode) redirect(HOME_PATHS.company);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: t("errors.resetExpired") };
  }
  redirect("/home");
}
