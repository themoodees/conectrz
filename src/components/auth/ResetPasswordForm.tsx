"use client";

import { useActionState } from "react";
import { resetPassword, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextField } from "@/components/ui/TextField";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(resetPassword, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <TextField
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters."
      />
      <TextField
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
