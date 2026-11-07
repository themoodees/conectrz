import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { termsOfService } from "@/content/legal/terms";
import { termsOfServiceJa } from "@/content/legal/terms.ja";

const documentFor = (locale: string) => (locale === "ja" ? termsOfServiceJa : termsOfService);

export async function generateMetadata(): Promise<Metadata> {
  return { title: documentFor(await getLocale()).title };
}

/** Text lives in src/content/legal/terms.ts (English) and terms.ja.ts (Japanese translation). */
export default async function TermsPage() {
  return <LegalDocumentView document={documentFor(await getLocale())} />;
}
