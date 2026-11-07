import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalShell } from "@/components/legal/LegalShell";
import { legalNotice } from "@/content/legal/legalNotice";

export const metadata: Metadata = { title: "Legal Notice (特定商取引法に基づく表記)" };

/** Table content lives in src/content/legal/legalNotice.ts (English and Japanese values). */
export default async function LegalNoticePage() {
  const isJapanese = (await getLocale()) === "ja";

  return (
    <LegalShell
      title={legalNotice.title}
      subtitle={isJapanese ? legalNotice.subtitleJa : legalNotice.subtitle}
      lastUpdated={legalNotice.lastUpdated}
    >
      <dl className="divide-y divide-border rounded-card border border-border">
        {legalNotice.rows.map((row) => (
          <div key={row.label} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
            <dt className="text-sm font-semibold text-ink" lang="ja">
              {row.label}
              <span className="block text-xs font-normal text-muted" lang="en">
                {row.en}
              </span>
            </dt>
            <dd className="text-sm text-graphite">{isJapanese ? row.valueJa : row.value}</dd>
          </div>
        ))}
      </dl>
    </LegalShell>
  );
}
