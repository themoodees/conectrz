import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { buttonClass } from "@/components/ui/buttonStyles";
import { ChevronDownIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL, isMockMode } from "@/lib/config";
import { getSupabaseSession } from "@/lib/data/session";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

interface FaqGroup {
  id: string;
  title: string;
  intro: string;
  items: { q: string; a: string }[];
}

export default async function FaqPage() {
  const t = await getTranslations("faq");
  const FAQ_GROUPS = t.raw("groups") as FaqGroup[];
  const isSignedIn = isMockMode ? false : Boolean((await getSupabaseSession()).user);

  // Lets search engines show the questions.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((group) => group.items).map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <MarketingHeader isSignedIn={isSignedIn} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <p className="text-sm font-semibold text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-4xl leading-[1.1] font-semibold text-ink md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-graphite">{t("subtitle")}</p>

          <nav aria-label={t("sections")} className="mt-8 flex flex-wrap gap-2">
            {FAQ_GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-graphite transition-colors hover:border-primary hover:text-primary"
              >
                {group.title}
              </a>
            ))}
          </nav>

          {FAQ_GROUPS.map((group) => (
            <section key={group.id} id={group.id} className="mt-14 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-ink md:text-3xl">{group.title}</h2>
              <p className="mt-1 text-sm text-muted">{group.intro}</p>
              <div className="mt-5 divide-y divide-border rounded-card border border-border">
                {group.items.map((item) => (
                  <details key={item.q} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <ChevronDownIcon className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-graphite">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="mt-16 rounded-card bg-surface px-6 py-8 text-center">
            <h2 className="text-xl font-semibold text-ink">{t("stillQuestion")}</h2>
            <p className="mt-1 text-sm text-graphite">{t("happyToHelp")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a href={`mailto:${SUPPORT_EMAIL}`} className={buttonClass({ variant: "secondary" })}>
                {t("emailUs")}
              </a>
              <Link href="/signup" className={buttonClass()}>
                {t("getStarted")}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
