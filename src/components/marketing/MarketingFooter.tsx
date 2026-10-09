import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { SUPPORT_EMAIL } from "@/lib/config";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:px-6 lg:px-8">
        <Logo href="/" />
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted md:ml-auto"
        >
          <Link href="/signup" className="hover:text-ink">
            For brands
          </Link>
          <Link href="/signup/creator" className="hover:text-ink">
            For creators
          </Link>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/legal/tokushoho" className="hover:text-ink">
            特定商取引法に基づく表記
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
            Contact
          </a>
        </nav>
        <p className="text-xs text-muted">© {new Date().getFullYear()} Conectrz</p>
      </div>
    </footer>
  );
}
