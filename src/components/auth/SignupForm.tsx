"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { TextField } from "@/components/ui/TextField";
import { FormMessage } from "@/components/ui/FormMessage";

const COPY = {
  company: {
    nameLabel: "Company name",
    nameAutoComplete: "organization",
    switchText: "Are you a creator?",
    switchLink: "Join as a creator",
    switchHref: "/signup/creator",
  },
  creator: {
    nameLabel: "Your name (shown on your profile)",
    nameAutoComplete: "name",
    switchText: "Hiring creators?",
    switchLink: "Create a company account",
    switchHref: "/signup",
  },
};

/** Sign-up form for companies and creators. */
export function SignupForm({ role }: { role: "company" | "creator" }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUp, {});
  const copy = COPY[role];

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
      <input type="hidden" name="role" value={role} />
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}

      <TextField
        label={copy.nameLabel}
        name="name"
        autoComplete={copy.nameAutoComplete}
        required
        defaultValue={state.values?.name}
      />
      <TextField
        label={role === "company" ? "Work email" : "Email"}
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

      <div className="space-y-1.5 text-center text-sm text-muted">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
            Sign in
          </Link>
        </p>
        <p>
          {copy.switchText}{" "}
          <Link
            href={copy.switchHref}
            className="font-semibold text-primary hover:text-primary-hover"
          >
            {copy.switchLink}
          </Link>
        </p>
      </div>
    </form>
  );
}
