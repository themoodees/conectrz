"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/TextField";
import { FormMessage } from "@/components/ui/FormMessage";

const SWITCH_HREF = { company: "/signup/creator", creator: "/signup/company" } as const;
const NAME_AUTOCOMPLETE = { company: "organization", creator: "name" } as const;

/** Sign-up form for companies and creators. */
export function SignupForm({ role }: { role: "company" | "creator" }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUp, {});
  const t = useTranslations("auth.signup");

  if (state.notice) {
    return (
      <div className="space-y-5">
        <FormMessage tone="success">{state.notice}</FormMessage>
        <Link href="/login" className={buttonClass({ variant: "secondary", className: "w-full" })}>
          {t("backToSignIn")}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="role" value={role} />
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

      <TextField
        label={role === "company" ? t("companyName") : t("creatorName")}
        name="name"
        autoComplete={NAME_AUTOCOMPLETE[role]}
        required
        defaultValue={state.values?.name}
      />
      <TextField
        label={role === "company" ? t("workEmail") : t("email")}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
      />
      <TextField
        label={t("password")}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint={t("passwordHint")}
      />

      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? t("submitting") : t("submit")}
      </button>
      <p className="text-center text-xs text-muted">
        {t("agreePrefix")}
        <Link href="/terms" className="underline hover:text-ink">
          {t("terms")}
        </Link>
        {t("and")}
        <Link href="/privacy" className="underline hover:text-ink">
          {t("privacy")}
        </Link>
        {t("agreeSuffix")}
      </p>

      <div className="space-y-1.5 text-center text-sm text-muted">
        <p>
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
            {t("signIn")}
          </Link>
        </p>
        <p>
          {role === "company" ? t("switchToCreator") : t("switchToCompany")}{" "}
          <Link
            href={SWITCH_HREF[role]}
            className="font-semibold text-primary hover:text-primary-hover"
          >
            {role === "company" ? t("switchToCreatorLink") : t("switchToCompanyLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
