"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestPasswordReset, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextField } from "@/components/ui/TextField";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgot");
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    {},
  );

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
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <TextField label={t("email")} name="email" type="email" autoComplete="email" required />
      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? t("submitting") : t("submit")}
      </button>
      <p className="text-center text-sm text-muted">
        {t("remembered")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
}
