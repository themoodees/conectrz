"use client";

import { useActionState, type ReactNode } from "react";
import {
  changePassword,
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

export function CompanyDetailsForm({
  name,
  contactEmail,
}: {
  name: string;
  contactEmail: string;
}) {
  const [state, formAction, pending] = useActionState(updateCompanyDetails, {});
  return (
    <form action={formAction} className="max-w-md space-y-4">
      <FormStatus state={state} />
      <TextField label="Company name" name="name" defaultValue={name} required />
      <TextField
        label="Contact email"
        name="contactEmail"
        type="email"
        defaultValue={contactEmail}
        required
        hint="Where Conectrz contacts you about your account."
      />
      <button type="submit" disabled={pending} className={buttonClass()}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, {});
  return (
    <form action={formAction} className="max-w-md space-y-4">
      <FormStatus state={state} />
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <TextField
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <button type="submit" disabled={pending} className={buttonClass({ variant: "secondary" })}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
