import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui/buttonStyles";

export default async function CreatorNotFound() {
  const t = await getTranslations("app.discovery.notFound");
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("text")}</p>
      <Link href="/discover" className={buttonClass({ className: "mt-6" })}>
        {t("back")}
      </Link>
    </div>
  );
}
