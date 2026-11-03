import Link from "next/link";
import { HeroCollage } from "@/components/marketing/HeroCollage";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import {
  BRAND_STEPS,
  CLOSING,
  CREATOR_STEPS,
  HERO,
  PAIN,
  WHY,
} from "@/components/marketing/homeContent";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import {
  ApplyPreview,
  ChatPreview,
  DiscoverPreview,
  ProfilePreview,
  ProjectPreview,
  ProjectsBrowsePreview,
} from "@/components/marketing/previews";
import { buttonClass } from "@/components/ui/buttonStyles";
import {
  BriefcaseIcon,
  CheckIcon,
  MapPinIcon,
  MessageIcon,
  SearchIcon,
  StarIcon,
} from "@/components/ui/icons";
import { isMockMode } from "@/lib/config";
import { getSupabaseSession } from "@/lib/data/session";
import { mockCreators } from "@/mocks/creators";

const WHY_ICONS = {
  map: MapPinIcon,
  search: SearchIcon,
  briefcase: BriefcaseIcon,
  star: StarIcon,
  message: MessageIcon,
  check: CheckIcon,
};

const brandPreviews = [
  <DiscoverPreview key="d" />,
  <ProfilePreview key="p" />,
  <ChatPreview key="c" />,
  <ProjectPreview key="j" />,
];
const creatorPreviews = [
  <ProfilePreview key="p" />,
  <ProjectsBrowsePreview key="b" />,
  <ApplyPreview key="a" />,
  <ChatPreview key="c" />,
];

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
              <p className="mt-4 max-w-md text-sm text-muted">
                {HERO.note}{" "}
                <Link href="/pricing" className="font-medium text-primary hover:underline">
                  See pricing
                </Link>
              </p>
            </div>
            <HeroCollage photos={photos} />
          </div>
        </section>

        {/* Save hours of research */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-page px-4 py-16 md:px-6 md:py-20 lg:px-8">
            <p className="text-sm font-semibold text-primary">{PAIN.eyebrow}</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-ink md:text-4xl">
              {PAIN.title}
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-graphite">{PAIN.description}</p>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-card border border-border bg-white p-6">
                <p className="text-sm font-semibold text-muted">{PAIN.before.label}</p>
                <ul className="mt-4 space-y-3">
                  {PAIN.before.items.map((item) => (
                    <li key={item} className="flex gap-3 text-graphite">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface text-xs text-muted"
                      >
                        ✕
                      </span>
                      <span className="text-muted line-through decoration-muted/40">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-card border-2 border-primary bg-white p-6">
                <p className="text-sm font-semibold text-primary">{PAIN.after.label}</p>
                <ul className="mt-4 space-y-3">
                  {PAIN.after.items.map((item) => (
                    <li key={item} className="flex gap-3 text-ink">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-white"
                      >
                        <CheckIcon className="size-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup/company" className={buttonClass({ className: "mt-6" })}>
                  Find your creator
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative scroll-mt-16 border-t border-border">
          <span id="brands" className="absolute -top-16" />
          <span id="creators" className="absolute -top-16" />
          <div className="mx-auto max-w-page px-4 py-16 md:px-6 md:py-20 lg:px-8">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-ink md:text-4xl">
              From first search to finished content
            </h2>
            <div className="mt-8">
              <HowItWorks
                steps={{
                  brands: BRAND_STEPS.map((s, i) => ({ ...s, preview: brandPreviews[i] })),
                  creators: CREATOR_STEPS.map((s, i) => ({ ...s, preview: creatorPreviews[i] })),
                }}
              />
            </div>
          </div>
        </section>

        {/* Why Conectrz */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-page px-4 py-16 md:px-6 md:py-20 lg:px-8">
            <p className="text-sm font-semibold text-primary">{WHY.eyebrow}</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-ink md:text-4xl">
              {WHY.title}
            </h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WHY.items.map((item) => {
                const Icon = WHY_ICONS[item.icon];
                return (
                  <li key={item.title} className="rounded-card border border-border bg-white p-6">
                    <span className="grid size-10 place-items-center rounded-lg bg-primary-light text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-graphite">{item.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 pb-16 md:px-6 lg:px-8">
          <div className="mx-auto max-w-page rounded-card bg-ink px-6 py-12 text-center md:py-16">
            <h2 className="text-3xl font-semibold text-white md:text-4xl">{CLOSING.title}</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/70">{CLOSING.description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={CLOSING.cta.href} className={buttonClass()}>
                {CLOSING.cta.label}
              </Link>
              <Link
                href="/signup/creator"
                className="inline-flex h-11 items-center rounded-control px-4 text-sm font-semibold text-white/80 hover:text-white"
              >
                I&apos;m a creator
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
