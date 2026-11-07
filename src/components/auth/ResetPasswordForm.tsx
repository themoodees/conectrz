"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resetPassword, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextField } from "@/components/ui/TextField";

export function ResetPasswordForm() {
  const t = useTranslations("auth.reset");
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(resetPassword, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <TextField
        label={t("newPassword")}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint={t("hint")}
      />
      <TextField
        label={t("confirm")}
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
