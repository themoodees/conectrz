import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { SUPPORT_EMAIL } from "@/lib/config";

export async function MarketingFooter() {
  const t = await getTranslations("nav");
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:px-6 lg:px-8">
        <Logo href="/" />
        <nav
          aria-label={t("footer")}
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted md:ml-auto"
        >
          <Link href="/signup" className="hover:text-ink">
            {t("forBrands")}
          </Link>
          <Link href="/signup/creator" className="hover:text-ink">
            {t("forCreators")}
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            {t("pricing")}
          </Link>
          <Link href="/faq" className="hover:text-ink">
            {t("faq")}
          </Link>
          <Link href="/login" className="hover:text-ink">
            {t("signIn")}
          </Link>
          <Link href="/terms" className="hover:text-ink">
            {t("terms")}
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            {t("privacy")}
          </Link>
          <Link href="/legal-notice" className="hover:text-ink">
            {t("legalNotice")}
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
            {t("contact")}
          </a>
        </nav>
        <LanguageSwitcher />
        <p className="text-xs text-muted">© {new Date().getFullYear()} Conectrz</p>
      </div>
    </footer>
  );
}
