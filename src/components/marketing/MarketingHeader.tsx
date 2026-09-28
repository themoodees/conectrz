import Link from "next/link";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";

/** Public header. Signed-in visitors get a shortcut into the app instead of sign-in links. */
export function MarketingHeader({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-page items-center gap-6 px-4 md:px-6 lg:px-8">
        <Logo href="/" />
        <nav aria-label="Homepage sections" className="hidden gap-1 md:flex">
          <a href="#brands" className="px-3 py-2 text-sm font-medium text-muted hover:text-ink">
            For brands
          </a>
          <a href="#creators" className="px-3 py-2 text-sm font-medium text-muted hover:text-ink">
            For creators
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isSignedIn ? (
            <Link href="/home" className={buttonClass({ size: "sm" })}>
              Open Conectrz
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonClass({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonClass({ size: "sm" })}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
