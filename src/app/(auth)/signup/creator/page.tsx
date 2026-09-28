import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Join as a creator" };

export default function CreatorSignupPage() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Join as a creator</h1>
      <p className="mt-2 mb-8 text-muted">
        Get discovered by brands looking for creators in Japan.
      </p>
      <SignupForm role="creator" />
    </>
  );
}
