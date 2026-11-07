"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LOCALE_LABELS, isLocale, type Locale } from "@/i18n/config";
import { translateProject } from "@/lib/actions/projects";
import type { ProjectTranslation } from "@/lib/data/projects";

interface Props {
  projectId: string;
  title: string;
  description: string;
  writtenLanguage: Locale;
  translation: ProjectTranslation | null;
  /** Rendered between the title and the description (company, budget, deadline). */
  children: ReactNode;
}

/**
 * Title + description of a brief, with a "Translate" button when it is written in another
 * language than the reader's. Translations are stored, so after the first request they are
 * simply shown (with a link back to the original).
 */
export function ProjectBrief({
  projectId,
  title,
  description,
  writtenLanguage,
  translation,
  children,
}: Props) {
  const t = useTranslations("app.projects.translate");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const showing = translation && !showOriginal ? translation : { title, description };
  const sourceCode = translation?.sourceLanguage ?? writtenLanguage;
  const sourceName = isLocale(sourceCode) ? LOCALE_LABELS[sourceCode] : sourceCode;
  const canTranslate = !translation && writtenLanguage !== locale && isLocale(locale);

  const translate = () => {
    setError(null);
    startTransition(async () => {
      const result = await translateProject(projectId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <>
      <h1 className="mt-3 text-[1.75rem] leading-tight font-semibold text-ink md:text-3xl">
        {showing.title}
      </h1>
      {children}
      {canTranslate && (
        <div className="mt-6">
          <button
            type="button"
            onClick={translate}
            disabled={pending}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-graphite hover:text-ink disabled:opacity-60"
          >
            {pending ? t("translating") : t("translate", { language: LOCALE_LABELS[locale] })}
          </button>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
      {translation && (
        <p className="mt-6 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          {!showOriginal && <span>{t("translatedFrom", { language: sourceName })}</span>}
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="font-medium text-primary hover:underline"
          >
            {showOriginal ? t("showTranslation") : t("showOriginal")}
          </button>
        </p>
      )}
      <p className="mt-3 text-base whitespace-pre-line text-graphite">{showing.description}</p>
    </>
  );
}
