import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplyPanel } from "@/components/projects/ApplyPanel";
import { ProjectStatusBadge, TagList } from "@/components/projects/ProjectBadges";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { PaymentMethodTags, PaymentNotice } from "@/components/payments/PaymentInfo";
import { getOwnCreatorEditorData } from "@/lib/data/creatorAccount";
import { getCreatorProject } from "@/lib/data/projects";
import { formatDeadline, formatShortDate, formatUsd } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/creator/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const project = await getCreatorProject(id);
  return { title: project?.title ?? "Project" };
}

export default async function CreatorProjectPage({
  params,
}: PageProps<"/creator/projects/[id]">) {
  const { id } = await params;
  const [project, me] = await Promise.all([getCreatorProject(id), getOwnCreatorEditorData()]);
  if (!project) notFound();

  return (
    <PageContainer>
      <Link
        href="/creator/projects"
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        Projects
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_26rem]">
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <ProjectStatusBadge status={project.status} />
            <span className="text-xs text-muted">Posted {formatShortDate(project.createdAt)}</span>
          </div>
          <h1 className="mt-3 text-[1.75rem] leading-tight font-semibold text-ink md:text-3xl">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-muted">{project.companyName}</p>
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
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-ink">How the company will pay</h2>
            <PaymentMethodTags
              methods={project.paymentMethods}
              highlight={me?.paymentMethods ?? []}
            />
            <PaymentNotice className="mt-2" />
          </div>
        </section>

        <aside>
          <ApplyPanel
            projectId={project.id}
            isOpen={project.status === "open"}
            application={project.application}
            budgetUsd={project.budgetUsd}
            projectMethods={project.paymentMethods}
            myMethods={me?.paymentMethods ?? []}
          />
        </aside>
      </div>
    </PageContainer>
  );
}
