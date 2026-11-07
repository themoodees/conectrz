import { getTranslations } from "next-intl/server";
import { signOut } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";

/** Shown when an admin has paused or banned the signed-in account. */
export async function AccountPaused({ status }: { status: "paused" | "deleted" }) {
  const t = await getTranslations("app");
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Logo href="/" />
      <h1 className="mt-10 text-3xl font-semibold text-ink">
        {status === "paused" ? t("status.pausedTitle") : t("status.closedTitle")}
      </h1>
      <p className="mt-2 text-muted">{t("status.contactSupport")}</p>
      <form action={signOut} className="mt-8">
        <button type="submit" className={buttonClass({ variant: "secondary" })}>
          {t("nav.signOut")}
        </button>
      </form>
    </div>
  );
}
