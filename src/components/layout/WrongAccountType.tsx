import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";

/** Shown when a signed-in user opens an area meant for another account type. */
export function WrongAccountType({ areaName }: { areaName: string }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Logo href="/home" />
      <h1 className="mt-10 text-3xl font-semibold text-ink">This area is for {areaName}</h1>
      <p className="mt-2 text-muted">
        You&apos;re signed in with a different kind of account.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/home" className={buttonClass()}>
          Go to my account
        </Link>
        <form action={signOut}>
          <button type="submit" className={buttonClass({ variant: "secondary" })}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
