import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";

/** Public header. Signed-in visitors get a shortcut into the app instead of sign-in links. */
export async function MarketingHeader({ isSignedIn }: { isSignedIn: boolean }) {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-page items-center gap-6 px-4 md:px-6 lg:px-8">
        <Logo href="/" />
        <nav aria-label={t("main")} className="hidden gap-1 md:flex">
          <Link href="/#brands" className="px-3 py-2 text-sm font-medium text-muted hover:text-ink">
            {t("forBrands")}
          </Link>
          <Link
            href="/#creators"
            className="px-3 py-2 text-sm font-medium text-muted hover:text-ink"
          >
            {t("forCreators")}
          </Link>
          <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-muted hover:text-ink">
            {t("pricing")}
          </Link>
          <Link href="/faq" className="px-3 py-2 text-sm font-medium text-muted hover:text-ink">
            {t("faq")}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
          <LanguageSwitcher className="hidden min-[480px]:block" />
          {isSignedIn ? (
            <Link href="/home" className={buttonClass({ size: "sm" })}>
              {t("openApp")}
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonClass({ variant: "ghost", size: "sm" })}>
                {t("signIn")}
              </Link>
              <Link href="/signup" className={buttonClass({ size: "sm" })}>
                {t("getStarted")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
