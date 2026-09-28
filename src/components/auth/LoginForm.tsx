"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/TextField";
import { FormMessage } from "./FormMessage";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(logIn, {
    error: initialError,
  });

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

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
        autoComplete="current-password"
        required
      />

      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-muted">
        New to Conectrz?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:text-primary-hover">
          Create a company account
        </Link>
      </p>
    </form>
  );
}
