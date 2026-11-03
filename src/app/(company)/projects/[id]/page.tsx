import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicantList } from "@/components/projects/ApplicantList";
import { ProjectStatusBadge, TagList } from "@/components/projects/ProjectBadges";
import { ProjectReferences } from "@/components/projects/ProjectReferences";
import { PaymentMethodTags, PaymentNotice } from "@/components/payments/PaymentInfo";
import { ProjectStatusButton } from "@/components/projects/ProjectStatusButton";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getCompanyProject } from "@/lib/data/projects";
import { formatDeadline, formatShortDate, formatUsd } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const found = await getCompanyProject(id);
  return { title: found?.project.title ?? "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
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
        Projects
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <ProjectStatusBadge status={project.status} />
            <span className="text-xs text-muted">Posted {formatShortDate(project.createdAt)}</span>
          </div>
          <h1 className="mt-3 text-[1.75rem] leading-tight font-semibold text-ink md:text-3xl">
            {project.title}
          </h1>
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:max-w-md">
            <div>
              <dt className="text-xs font-medium text-muted">Budget</dt>
              <dd className="text-lg font-semibold text-ink">{formatUsd(project.budgetUsd)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Deliver by</dt>
              <dd className="text-lg font-semibold text-ink">
                {formatDeadline(project.deliveryDeadline)}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-base whitespace-pre-line text-graphite">{project.description}</p>
          <dl className="mt-6 space-y-4">
            <TagList label="Services" items={project.services} />
            <TagList label="Niches" items={project.niches} />
            <TagList label="Languages" items={project.languages} />
          </dl>
          <ProjectReferences references={project.references} />
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-ink">How you will pay</h2>
            <PaymentMethodTags methods={project.paymentMethods} />
            <PaymentNotice className="mt-2" />
          </div>
          <div className="mt-8">
            <ProjectStatusButton projectId={project.id} status={project.status} />
            <p className="mt-2 text-xs text-muted">
              {project.status === "open"
                ? "Closing a project hides it from creators and stops new applications."
                : "Reopening makes it visible to creators again."}
            </p>
          </div>
        </section>

        <section aria-labelledby="applicants-heading">
          <h2 id="applicants-heading" className="text-lg font-semibold text-ink">
            Applications ({applicants.length})
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
              No applications yet. Creators who fit your brief will be able to apply while the
              project is open.
            </p>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
