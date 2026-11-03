import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error, deleted } = await searchParams;

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 mb-8 text-muted">
        {deleted === "1"
          ? "Your account has been deleted. Thank you for being part of Conectrz."
          : "Sign in to your Conectrz account."}
      </p>
      <LoginForm
        next={typeof next === "string" ? next : undefined}
        initialError={
          error === "confirmation"
            ? "This confirmation link was already used or has expired. If you already clicked it, your email is confirmed: just sign in below."
            : error === "reset"
              ? "That reset link is invalid or has expired. Request a new one below."
              : undefined
        }
      />
    </>
  );
}
