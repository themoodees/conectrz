import { signOut } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";

/** Shown when an admin has paused or banned the signed-in account. */
export function AccountPaused({ status }: { status: "paused" | "deleted" }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Logo href="/" />
      <h1 className="mt-10 text-3xl font-semibold text-ink">
        {status === "paused" ? "Your account is paused" : "Your account has been closed"}
      </h1>
      <p className="mt-2 text-muted">
        If you think this is a mistake, please contact Conectrz support.
      </p>
      <form action={signOut} className="mt-8">
        <button type="submit" className={buttonClass({ variant: "secondary" })}>
          Sign out
        </button>
      </form>
    </div>
  );
}
