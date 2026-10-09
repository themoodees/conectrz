import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { privacyPolicy } from "@/content/legal/privacy";

export const metadata: Metadata = { title: "Privacy Policy" };

/** Text lives in src/content/legal/privacy.ts. */
export default function PrivacyPage() {
  return <LegalDocumentView document={privacyPolicy} />;
}
