import type { Metadata } from "next";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { termsOfService } from "@/content/legal/terms";

export const metadata: Metadata = { title: "Terms of Service" };

/** Text lives in src/content/legal/terms.ts. */
export default function TermsPage() {
  return <LegalDocumentView document={termsOfService} />;
}
