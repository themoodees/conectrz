import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create a company account" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Create a company account</h1>
      <p className="mt-2 mb-8 text-muted">
        Find and connect with creators living in Japan.
      </p>
      <SignupForm />
    </>
  );
}
