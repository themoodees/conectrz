"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/TextField";
import { FormMessage } from "./FormMessage";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUp, {});

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

      <TextField
        label="Company name"
        name="companyName"
        autoComplete="organization"
        required
        defaultValue={state.values?.companyName}
      />
      <TextField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        hint="At least 8 characters."
      />

      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </form>
  );
}
