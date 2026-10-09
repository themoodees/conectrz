import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";
import { tokushoho } from "@/content/legal/tokushoho";

export const metadata: Metadata = { title: "特定商取引法に基づく表記" };

/** Table content lives in src/content/legal/tokushoho.ts. */
export default function TokushohoPage() {
  return (
    <LegalShell
      title={tokushoho.title}
      subtitle={tokushoho.subtitle}
      lastUpdated={tokushoho.lastUpdated}
    >
      <dl className="divide-y divide-border rounded-card border border-border">
        {tokushoho.rows.map((row) => (
          <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="text-sm font-semibold text-ink">
              {row.label}
              <span className="block text-xs font-normal text-muted">{row.en}</span>
            </dt>
            <dd className="text-sm text-graphite">{row.value}</dd>
          </div>
        ))}
      </dl>
    </LegalShell>
  );
}
