import { signOut } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";

/** Shown to signed-in users who aren't companies (e.g. creators). */
export function CompanyAccountRequired() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Logo href="/login" />
      <h1 className="mt-10 text-3xl font-semibold text-ink">Company account required</h1>
      <p className="mt-2 text-muted">
        This part of Conectrz is for companies. You&apos;re signed in with a different kind of
        account.
      </p>
      <form action={signOut} className="mt-8">
        <button type="submit" className={buttonClass({ variant: "secondary" })}>
          Sign out
        </button>
      </form>
    </div>
  );
}
