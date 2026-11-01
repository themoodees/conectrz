import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { buttonClass } from "@/components/ui/buttonStyles";
import { BriefcaseIcon, PlusIcon } from "@/components/ui/icons";
import { getCompanyProjects } from "@/lib/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getCompanyProjects();

  return (
    <PageContainer>
      <header className="flex flex-wrap items-end justify-between gap-4 pt-7 pb-6 md:pt-10 md:pb-7">
        <div>
          <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
            Projects
          </h1>
          <p className="mt-2 max-w-xl text-base text-muted">
            Post what you need and let creators come to you with a message and a price.
          </p>
        </div>
        <Link href="/projects/new" className={buttonClass()}>
          <PlusIcon className="size-4" />
          Post a project
        </Link>
      </header>

      {projects.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                project={project}
                href={`/projects/${project.id}`}
                footer={
                  <p className="text-sm font-medium text-ink">
                    {project.applicantCount === 0
                      ? "No applications yet"
                      : `${project.applicantCount} ${project.applicantCount === 1 ? "application" : "applications"} to review`}
                  </p>
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
            <BriefcaseIcon className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-ink">No projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Post your first project and creators who fit will be able to apply.
          </p>
          <Link href="/projects/new" className={buttonClass({ className: "mt-5" })}>
            Post a project
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
