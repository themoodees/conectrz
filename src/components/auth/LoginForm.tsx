"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { logIn, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/TextField";
import { FormMessage } from "@/components/ui/FormMessage";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const t = useTranslations("auth.login");
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(logIn, {
    error: initialError,
  });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

      <TextField
        label={t("workEmail")}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
      />
      <div>
        <TextField
          label={t("password")}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Link
          href="/forgot-password"
          className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t("forgot")}
        </Link>
      </div>

      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? t("submitting") : t("submit")}
      </button>

      <div className="space-y-1.5 text-center text-sm text-muted">
        <p>
          {t("newHere")}{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-primary-hover">
            {t("createCompany")}
          </Link>
        </p>
        <p>
          {t("areCreator")}{" "}
          <Link
            href="/signup/creator"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            {t("joinCreator")}
          </Link>
        </p>
      </div>
    </form>
  );
}
