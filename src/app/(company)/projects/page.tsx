import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { buttonClass } from "@/components/ui/buttonStyles";
import { BriefcaseIcon, PlusIcon } from "@/components/ui/icons";
import { Pagination } from "@/components/ui/Pagination";
import { getCompanyProjects } from "@/lib/data/projects";
import { PAGE_SIZE, paginate, parsePage } from "@/lib/pagination";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.companyProjects");
  return { title: t("title") };
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const t = await getTranslations("app.companyProjects");
  const [allProjects, { page: pageParam }] = await Promise.all([
    getCompanyProjects(),
    searchParams,
  ]);
  const paged = paginate(allProjects, parsePage(pageParam), PAGE_SIZE.projects);
  const projects = paged.items;

  return (
    <PageContainer>
      <header className="flex flex-wrap items-end justify-between gap-4 pt-7 pb-6 md:pt-10 md:pb-7">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-xl text-base text-muted">{t("intro")}</p>
        </div>
        <Link href="/projects/new" className={buttonClass()}>
          <PlusIcon className="size-4" />
          {t("post")}
        </Link>
      </header>

      {allProjects.length > 0 ? (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard
                  project={project}
                  href={`/projects/${project.id}`}
                  footer={
                    <p className="text-sm font-medium text-ink">
                      {project.applicantCount === 0
                        ? t("noApplications")
                        : t("applicationsToReview", { count: project.applicantCount })}
                    </p>
                  }
                />
              </li>
            ))}
          </ul>
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            hrefFor={(n) => `/projects?page=${n}`}
          />
        </>
      ) : (
        <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
            <BriefcaseIcon className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">{t("emptyTitle")}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">{t("emptyText")}</p>
          <Link href="/projects/new" className={buttonClass({ className: "mt-5" })}>
            {t("post")}
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
