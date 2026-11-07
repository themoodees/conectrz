import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { privacyPolicy } from "@/content/legal/privacy";
import { privacyPolicyJa } from "@/content/legal/privacy.ja";

const documentFor = (locale: string) => (locale === "ja" ? privacyPolicyJa : privacyPolicy);

export async function generateMetadata(): Promise<Metadata> {
  return { title: documentFor(await getLocale()).title };
}

/** Text lives in src/content/legal/privacy.ts (English) and privacy.ja.ts (Japanese translation). */
export default async function PrivacyPage() {
  return <LegalDocumentView document={documentFor(await getLocale())} />;
}
