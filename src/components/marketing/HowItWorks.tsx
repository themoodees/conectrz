"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type Audience = "brands" | "creators";

export interface HowStep {
  title: string;
  text: string;
  /** Preview shown while this step is selected. */
  preview: ReactNode;
}

/**
 * "How it works": tabs for brands and creators; pick a step to see that screen.
 * Opening /#brands or /#creators selects the matching tab.
 */
export function HowItWorks({ steps }: { steps: Record<Audience, HowStep[]> }) {
  const t = useTranslations();
  const [audience, setAudience] = useState<Audience>("brands");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "brands" || hash === "creators") {
        setAudience(hash);
        setActive(0);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const list = steps[audience];
  const current = list[active] ?? list[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("home.howItWorks.tabsLabel")}
        className="inline-flex rounded-control bg-white p-1 ring-1 ring-border"
      >
        {(["brands", "creators"] as const).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={audience === key}
            onClick={() => {
              setAudience(key);
              setActive(0);
            }}
            className={`h-9 rounded-lg px-4 text-sm font-semibold transition-colors ${
              audience === key ? "bg-primary text-white" : "text-graphite hover:text-ink"
            }`}
          >
            {key === "brands" ? t("nav.forBrands") : t("nav.forCreators")}
          </button>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <ol className="space-y-3">
          {list.map((step, index) => {
            const isActive = index === active;
            return (
              <li key={step.title}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={isActive ? "step" : undefined}
                  className={`w-full rounded-card border p-5 text-left transition-colors ${
                    isActive ? "border-primary bg-white" : "border-transparent hover:bg-white/70"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                        isActive ? "bg-primary text-white" : "bg-primary-light text-primary"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-lg font-semibold text-ink">{step.title}</span>
                  </span>
                  <span className="mt-2 block pl-10 text-sm leading-relaxed text-graphite">
                    {step.text}
                  </span>
                </button>
                {/* On small screens the preview opens right under the chosen step */}
                {isActive && <div className="mt-4 lg:hidden">{step.preview}</div>}
              </li>
            );
          })}
        </ol>
        <div className="hidden lg:sticky lg:top-24 lg:block">{current.preview}</div>
      </div>
    </div>
  );
}
