import type { LegalDocument } from "@/content/legal/types";
import { LegalShell } from "./LegalShell";

/** Renders a LegalDocument from src/content/legal. */
export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <LegalShell title={document.title} lastUpdated={document.lastUpdated}>
      <p className="leading-relaxed text-graphite">{document.intro}</p>
      <div className="mt-8 space-y-8">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold text-ink">{section.heading}</h2>
            {section.body.map((paragraph, index) => (
              <p key={index} className="mt-3 leading-relaxed text-graphite">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </LegalShell>
  );
}
