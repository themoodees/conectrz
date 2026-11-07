import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/lib/actions/auth";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";

/** Shown when a signed-in user opens an area meant for another account type. */
export async function WrongAccountType({
  areaName,
}: {
  areaName: "admins" | "companies" | "creators";
}) {
  const t = await getTranslations("app");
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <Logo href="/home" />
      <h1 className="mt-10 text-3xl font-semibold text-ink">
        {t("status.wrongTitle", {
          area: t(
            areaName === "admins"
              ? "status.areaAdmins"
              : areaName === "companies"
                ? "status.areaCompanies"
                : "status.areaCreators",
          ),
        })}
      </h1>
      <p className="mt-2 text-muted">{t("status.wrongText")}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/home" className={buttonClass()}>
          {t("status.goToAccount")}
        </Link>
        <form action={signOut}>
          <button type="submit" className={buttonClass({ variant: "secondary" })}>
            {t("nav.signOut")}
          </button>
        </form>
      </div>
    </div>
  );
}
