"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { TextField } from "@/components/ui/TextField";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.notice) {
    return (
      <div className="space-y-5">
        <FormMessage tone="success">{state.notice}</FormMessage>
        <Link href="/login" className={buttonClass({ variant: "secondary", className: "w-full" })}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </form>
  );
}
