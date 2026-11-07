import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Project } from "@/types/projects";
import { formatDeadline, formatUsd } from "@/lib/format";
import { ProjectStatusBadge, WrittenLanguageBadge } from "./ProjectBadges";

/** One project in a list. The whole title links to the project. */
export function ProjectCard({
  project,
  href,
  showCompany = false,
  badges,
  footer,
}: {
  project: Project;
  href: string;
  showCompany?: boolean;
  /** Extra badges shown next to the status (e.g. "Applied"). */
  badges?: ReactNode;
  footer?: ReactNode;
}) {
  const t = useTranslations("app.projects.card");
  const locale = useLocale();
  const tags = [...project.services, ...project.niches];
  return (
    <article className="relative rounded-card border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
        <WrittenLanguageBadge language={project.writtenLanguage} />
        {badges}
      </div>
      <h2 className="mt-3 text-lg leading-snug font-semibold text-ink">
        <Link href={href} className="after:absolute after:inset-0 hover:text-primary">
          {project.title}
        </Link>
      </h2>
      {showCompany && (
        <p className="mt-0.5 text-sm text-muted">
          {project.companyId ? (
            <Link
              href={`/creator/companies/${project.companyId}`}
              className="relative z-10 hover:text-primary hover:underline"
            >
              {project.companyName}
            </Link>
          ) : (
            project.companyName
          )}
        </p>
      )}
      <p className="mt-2 line-clamp-2 text-sm text-graphite">{project.description}</p>
      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div className="flex gap-1.5">
          <dt className="text-muted">{t("budget")}</dt>
          <dd className="font-semibold text-ink">{formatUsd(project.budgetUsd)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-muted">{t("deliverBy")}</dt>
          <dd className="font-semibold text-ink">
            {formatDeadline(project.deliveryDeadline, locale)}
          </dd>
        </div>
      </dl>
      {tags.length > 0 && <p className="mt-3 text-xs text-muted">{tags.slice(0, 4).join(" · ")}</p>}
      {footer && <div className="relative mt-4">{footer}</div>}
    </article>
  );
}
