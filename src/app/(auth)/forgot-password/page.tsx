import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Reset your password</h1>
      <p className="mt-2 mb-8 text-muted">
        Enter the email you signed up with and we&apos;ll send you a reset link.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
