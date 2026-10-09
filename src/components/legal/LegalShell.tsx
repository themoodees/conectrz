import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

/** Public page frame for legal documents, with a draft notice until the text is final. */
export function LegalShell({
  title,
  subtitle,
  lastUpdated,
  children,
}: {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const isDraft = lastUpdated.startsWith("[");

  return (
    <>
      <MarketingHeader isSignedIn={false} />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        {isDraft && (
          <p className="mb-8 rounded-control bg-primary-light px-4 py-3 text-sm text-ink">
            <span className="font-semibold">Draft.</span> This page is a placeholder. Replace the
            text in [brackets] with wording reviewed by a legal professional before launch.
          </p>
        )}
        <h1 className="text-3xl font-semibold text-ink md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <p className="mt-2 text-sm text-muted">Last updated: {lastUpdated}</p>
        <div className="mt-10">{children}</div>
      </main>
      <MarketingFooter />
    </>
  );
}
