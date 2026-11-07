import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicantList } from "@/components/projects/ApplicantList";
import { ProjectStatusBadge, TagList } from "@/components/projects/ProjectBadges";
import { ProjectReferences } from "@/components/projects/ProjectReferences";
import { PaymentMethodTags, PaymentNotice } from "@/components/payments/PaymentInfo";
import { ProjectStatusButton } from "@/components/projects/ProjectStatusButton";
import { buttonClass } from "@/components/ui/buttonStyles";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getCompanyProject } from "@/lib/data/projects";
import { formatDeadline, formatShortDate, formatUsd } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const found = await getCompanyProject(id);
  const t = await getTranslations("app.projects.page");
  return { title: found?.project.title ?? t("single") };
}

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const [t, tc, tt, locale] = await Promise.all([
    getTranslations("app.companyProjects"),
    getTranslations("app.projects.card"),
    getTranslations("app.projects.tags"),
    getLocale(),
  ]);
  const found = await getCompanyProject(id);
  if (!found) notFound();
  const { project, applicants } = found;

  return (
    <PageContainer>
      <Link
        href="/projects"
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        {t("title")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <ProjectStatusBadge status={project.status} />
            <span className="text-xs text-muted">{t("posted", { date: formatShortDate(project.createdAt, locale) })}</span>
            {project.editedAt && (
              <span className="text-xs text-muted">
                {t("edited", { date: formatShortDate(project.editedAt, locale) })}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-[1.75rem] leading-tight font-semibold text-ink md:text-3xl">
            {project.title}
          </h1>
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:max-w-md">
            <div>
              <dt className="text-xs font-medium text-muted">{tc("budget")}</dt>
              <dd className="text-lg font-semibold text-ink">{formatUsd(project.budgetUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">{tc("deliverBy")}</dt>
              <dd className="text-lg font-semibold text-ink">
                {formatDeadline(project.deliveryDeadline, locale)}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-base whitespace-pre-line text-graphite">{project.description}</p>
          <dl className="mt-6 space-y-4">
            <TagList label={tt("services")} items={project.services} />
            <TagList label={tt("niches")} items={project.niches} />
            <TagList label={tt("languages")} items={project.languages} />
          </dl>
          <ProjectReferences references={project.references} />
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-ink">{t("howYouPay")}</h2>
            <PaymentMethodTags methods={project.paymentMethods} />
            <PaymentNotice className="mt-2" />
          </div>
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-3">
              {project.status === "open" && (
                <Link
                  href={`/projects/${project.id}/edit`}
                  className={buttonClass({ variant: "secondary", size: "sm" })}
                >
                  {t("edit")}
                </Link>
              )}
              <ProjectStatusButton projectId={project.id} status={project.status} />
            </div>
            <p className="mt-2 text-xs text-muted">
              {project.status === "open" ? t("closeHint") : t("reopenHint")}
            </p>
          </div>
        </section>

        <section aria-labelledby="applicants-heading">
          <h2 id="applicants-heading" className="text-lg font-semibold text-ink">
            {t("applications", { count: applicants.length })}
          </h2>
          {applicants.length > 0 ? (
            <div className="mt-4">
              <ApplicantList
                projectMethods={project.paymentMethods}
                applicants={applicants}
                projectId={project.id}
                projectIsOpen={project.status === "open"}
              />
            </div>
          ) : (
            <p className="mt-4 rounded-card border border-dashed border-border p-6 text-sm text-muted">
              {t("noApplicationsDetail")}
            </p>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
