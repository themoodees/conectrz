import type { Metadata } from "next";
import { buttonClass } from "@/components/ui/buttonStyles";

export const metadata: Metadata = { title: "Confirm" };

/**
 * Landing page for links in auth emails. It only shows a button; the token is spent when the
 * button posts to /auth/confirm/verify, so email scanners that open the link cannot use it up.
 */
export default async function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  const params = await searchParams;
  const get = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : "");
  const isReset = get("next") === "/reset-password" || get("type") === "recovery";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold text-ink">
        {isReset ? "Reset your password" : "Confirm your email"}
      </h1>
      <p className="mt-2 mb-8 text-muted">
        {isReset
          ? "Press the button to continue and choose a new password."
          : "Press the button to finish creating your Conectrz account."}
      </p>
      <form action="/auth/confirm/verify" method="post">
        <input type="hidden" name="code" value={get("code")} />
        <input type="hidden" name="token_hash" value={get("token_hash")} />
        <input type="hidden" name="type" value={get("type")} />
        <input type="hidden" name="next" value={get("next")} />
        <button type="submit" className={buttonClass({ className: "w-full" })}>
          {isReset ? "Continue" : "Confirm my email"}
        </button>
      </form>
    </main>
  );
}
