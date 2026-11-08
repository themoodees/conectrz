import Link from "next/link";
import { getTranslations } from "next-intl/server";

/** Shown to active creators whose profile is hidden from companies because required parts are missing. */
export async function ProfileHiddenNotice({
  missing,
}: {
  missing: ("location" | "language" | "service")[];
}) {
  const t = await getTranslations("app.profileHidden");
  return (
    <div role="status" className="mx-auto mt-4 max-w-5xl px-4">
      <div className="rounded-control bg-primary-light px-4 py-3 text-sm text-ink">
        <p className="font-semibold">{t("title")}</p>
        <p className="mt-1">{t("body")}</p>
        <ul className="mt-1 list-disc pl-5">
          {missing.map((m) => (
            <li key={m}>{t(m)}</li>
          ))}
        </ul>
        <Link href="/creator/profile" className="mt-2 inline-block font-semibold underline">
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
