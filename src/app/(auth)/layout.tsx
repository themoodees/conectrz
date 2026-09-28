import { Logo } from "@/components/ui/Logo";
import { isMockMode } from "@/lib/config";

/** Shell for sign-in and sign-up: form on the left, brand panel on large screens. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-8">
        <Logo href="/login" />
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {isMockMode && (
            <p className="mb-6 rounded-control bg-surface px-3.5 py-2.5 text-xs text-graphite">
              <span className="font-semibold">Mock mode</span> — sign-in is simulated and any
              details will work. Set <code>NEXT_PUBLIC_DATA_SOURCE=supabase</code> to use real
              accounts.
            </p>
          )}
          {children}
        </main>
      </div>

      <aside className="relative hidden overflow-hidden bg-surface lg:flex lg:flex-col lg:justify-end lg:p-12">
        {/* A single, restrained brand-gradient moment */}
        <div
          aria-hidden="true"
          className="bg-brand-gradient absolute -top-24 -right-24 size-72 rounded-full opacity-90 blur-3xl"
        />
        <p className="relative max-w-md font-display text-4xl leading-tight font-semibold text-ink">
          Connect with creators living in Japan.
        </p>
        <p className="relative mt-3 max-w-md text-base text-graphite">
          Discover, save and message UGC and influencer creators — all in one place.
        </p>
      </aside>
    </div>
  );
}
