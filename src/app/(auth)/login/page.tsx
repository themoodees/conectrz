import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;

  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 mb-8 text-muted">Sign in to your Conectrz account.</p>
      <LoginForm
        next={typeof next === "string" ? next : undefined}
        initialError={
          error === "confirmation"
            ? "That confirmation link is invalid or has expired. Try signing in, or sign up again."
            : undefined
        }
      />
    </>
  );
}
