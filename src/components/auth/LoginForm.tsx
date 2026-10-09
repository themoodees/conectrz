"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/TextField";
import { FormMessage } from "@/components/ui/FormMessage";

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
      <div>
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Link
          href="/forgot-password"
          className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-hover"
        >
          Forgot password?
        </Link>
      </div>

      <button type="submit" disabled={pending} className={buttonClass({ className: "w-full" })}>
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div className="space-y-1.5 text-center text-sm text-muted">
        <p>
          New to Conectrz?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:text-primary-hover">
            Create a company account
          </Link>
        </p>
        <p>
          Are you a creator?{" "}
          <Link
            href="/signup/creator"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Join as a creator
          </Link>
        </p>
      </div>
    </form>
  );
}
