import { useTranslations } from "next-intl";
import { LOCALE_LABELS, type Locale } from "@/i18n/config";
import type { ApplicationStatus, ProjectStatus } from "@/types/projects";

const BADGE = "rounded-md px-2 py-0.5 text-xs font-semibold";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const t = useTranslations("app.projects.status");
  return status === "open" ? (
    <span className={`${BADGE} bg-primary-light text-primary`}>{t("open")}</span>
  ) : (
    <span className={`${BADGE} bg-surface text-graphite`}>{t("closed")}</span>
  );
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const t = useTranslations("app.projects.application");
  return (
    <span
      className={`${BADGE} ${
        status === "submitted" ? "bg-primary-light text-primary" : "bg-surface text-graphite"
      }`}
    >
      {t(status)}
    </span>
  );
}

/** Small grey tags for services, niches and languages. */
export function TagList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-graphite"
          >
            {item}
          </span>
        ))}
      </dd>
    </div>
  );
}

/** Which language the brief is written in, so creators can tell at a glance. */
export function WrittenLanguageBadge({ language }: { language: Locale }) {
  const t = useTranslations("app.projects.card");
  return (
    <span className={`${BADGE} bg-surface text-graphite`}>
      {t("writtenIn", { language: LOCALE_LABELS[language] })}
    </span>
  );
}
