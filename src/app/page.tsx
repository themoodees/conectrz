import Link from "next/link";
import { HeroCollage } from "@/components/marketing/HeroCollage";
import { BRAND_STEPS, CLOSING, CREATOR_BENEFITS, HERO } from "@/components/marketing/homeContent";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { buttonClass } from "@/components/ui/buttonStyles";
import { isMockMode } from "@/lib/config";
import { getSupabaseSession } from "@/lib/data/session";
import { mockCreators } from "@/mocks/creators";

/** Public homepage. Copy lives in components/marketing/homeContent.ts. */
export default async function HomePage() {
  const isSignedIn = isMockMode ? false : Boolean((await getSupabaseSession()).user);
  // PLACEHOLDER imagery: mock creator photos.
  const photos = mockCreators.slice(0, 6).map((c) => ({ src: c.photoUrl, name: c.displayName }));

  return (
    <>
      <MarketingHeader isSignedIn={isSignedIn} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="bg-brand-gradient absolute -top-40 -right-40 size-[28rem] rounded-full opacity-20 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-page items-center gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-semibold text-primary">{HERO.eyebrow}</p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold text-ink sm:text-5xl lg:text-[3.5rem]">
                {HERO.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-graphite">{HERO.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={HERO.primaryCta.href} className={buttonClass()}>
                  {HERO.primaryCta.label}
                </Link>
                <Link
                  href={HERO.secondaryCta.href}
                  className={buttonClass({ variant: "secondary" })}
                >
                  {HERO.secondaryCta.label}
                </Link>
              </div>
            </div>
            <HeroCollage photos={photos} />
          </div>
        </section>

        {/* For brands */}
        <section id="brands" className="scroll-mt-16 border-t border-border bg-surface">
          <div className="mx-auto max-w-page px-4 py-16 md:px-6 md:py-20 lg:px-8">
            <p className="text-sm font-semibold text-primary">For brands</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-ink md:text-4xl">
              From search to first message in minutes
            </h2>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {BRAND_STEPS.map((step, index) => (
                <li key={step.title} className="rounded-card border border-border bg-white p-6">
                  <span className="grid size-8 place-items-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">{step.text}</p>
                </li>
              ))}
            </ol>
            <Link href="/signup" className={buttonClass({ className: "mt-10" })}>
              Create a company account
            </Link>
          </div>
        </section>

        {/* For creators */}
        <section id="creators" className="scroll-mt-16">
          <div className="mx-auto grid max-w-page gap-10 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-[1fr_1.4fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold text-primary">For creators</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">
                Work with brands that want to reach Japan
              </h2>
              <p className="mt-4 text-graphite">
                Whether you create UGC, post to your own audience, or do both — build a profile and
                let brands come to you.
              </p>
              <Link
                href="/signup/creator"
                className={buttonClass({ variant: "secondary", className: "mt-8" })}
              >
                Join as a creator
              </Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
              {CREATOR_BENEFITS.map((benefit) => (
                <li key={benefit.title} className="border-l-2 border-primary pl-5">
                  <h3 className="text-lg font-semibold text-ink">{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-graphite">{benefit.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 pb-16 md:px-6 lg:px-8">
          <div className="mx-auto max-w-page rounded-card bg-ink px-6 py-12 text-center md:py-16">
            <h2 className="text-3xl font-semibold text-white md:text-4xl">{CLOSING.title}</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/70">{CLOSING.description}</p>
            <Link href={CLOSING.cta.href} className={buttonClass({ className: "mt-8" })}>
              {CLOSING.cta.label}
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
