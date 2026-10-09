import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";
import { legalNotice } from "@/content/legal/legalNotice";

export const metadata: Metadata = { title: "Legal Notice" };

/** Table content lives in src/content/legal/legalNotice.ts. */
export default function LegalNoticePage() {
  return (
    <LegalShell
      title={legalNotice.title}
      subtitle={legalNotice.subtitle}
      lastUpdated={legalNotice.lastUpdated}
    >
      <dl className="divide-y divide-border rounded-card border border-border">
        {legalNotice.rows.map((row) => (
          <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="text-sm font-semibold text-ink">{row.label}</dt>
            <dd className="text-sm text-graphite">{row.value}</dd>
          </div>
        ))}
      </dl>
    </LegalShell>
  );
}
