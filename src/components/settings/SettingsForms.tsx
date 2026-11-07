"use client";

import { useTranslations } from "next-intl";
import { useActionState, type ReactNode } from "react";
import {
  changePassword,
  deleteCreatorAccount,
  updateCompanyDetails,
  type SettingsFormState,
} from "@/lib/actions/account";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextField } from "@/components/ui/TextField";

/** A titled settings card. */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border p-5 md:p-6">
      <h2 className="font-sans text-base font-semibold tracking-normal text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FormStatus({ state }: { state: SettingsFormState }) {
  if (state.error) return <FormMessage tone="error">{state.error}</FormMessage>;
  if (state.success) return <FormMessage tone="success">{state.success}</FormMessage>;
  return null;
}

export function CompanyDetailsForm({ name, contactEmail }: { name: string; contactEmail: string }) {
  const t = useTranslations("app.settingsForms");
  const [state, formAction, pending] = useActionState(updateCompanyDetails, {});
  return (
    <form action={formAction} className="max-w-md space-y-4">
      <FormStatus state={state} />
      <TextField label={t("companyName")} name="name" defaultValue={name} required />
      <TextField
        label={t("contactEmail")}
        name="contactEmail"
        type="email"
        defaultValue={contactEmail}
        required
        hint={t("contactHint")}
      />
      <button type="submit" disabled={pending} className={buttonClass()}>
        {pending ? t("saving") : t("saveChanges")}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const t = useTranslations("app.settingsForms");
  const [state, formAction, pending] = useActionState(changePassword, {});
  return (
    <form action={formAction} className="max-w-md space-y-4">
      <FormStatus state={state} />
      <TextField
        label={t("newPassword")}
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <TextField
        label={t("confirmPassword")}
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <button type="submit" disabled={pending} className={buttonClass({ variant: "secondary" })}>
        {pending ? t("updating") : t("updatePassword")}
      </button>
    </form>
  );
}

export function DeleteAccountForm() {
  const t = useTranslations("app.settingsForms");
  const [state, formAction, pending] = useActionState(deleteCreatorAccount, {});
  return (
    <form action={formAction} className="max-w-md space-y-4">
      <FormStatus state={state} />
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
        <li>{t("delete1")}</li>
        <li>{t("delete2")}</li>
        <li>{t("delete3")}</li>
        <li>{t("delete4")}</li>
      </ul>
      <TextField label={t("typeDelete")} name="confirm" autoComplete="off" required />
      <button
        type="submit"
        disabled={pending}
        className={buttonClass({ variant: "secondary", className: "text-danger" })}
      >
        {pending ? t("deleting") : t("deleteButton")}
      </button>
    </form>
  );
}
