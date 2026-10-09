import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };

/** Reached from the reset email (via /auth/confirm, which signs the user in). */
export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Choose a new password</h1>
      <p className="mt-2 mb-8 text-muted">You&apos;ll use it the next time you sign in.</p>
      <ResetPasswordForm />
    </>
  );
}
