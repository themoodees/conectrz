import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationStatusBadge } from "@/components/projects/ProjectBadges";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreatorProjectBrowser } from "@/components/projects/CreatorProjectBrowser";
import { getCreatorProjects, getProjectFormOptions } from "@/lib/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function CreatorProjectsPage() {
  const [projects, options] = await Promise.all([getCreatorProjects(), getProjectFormOptions()]);
  const applied = projects.filter((p) => p.application);
  const open = projects.filter((p) => p.status === "open" && !p.application);

  const renderList = (list: typeof projects) => (
    <ul className="grid gap-4 md:grid-cols-2">
      {list.map((project) => (
        <li key={project.id}>
          <ProjectCard
            project={project}
            href={`/creator/projects/${project.id}`}
            showCompany
            badges={
              project.application && <ApplicationStatusBadge status={project.application.status} />
            }
          />
        </li>
      ))}
    </ul>
  );

  return (
    <PageContainer>
      <header className="pt-7 pb-6 md:pt-10 md:pb-7">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          Projects
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted">
          Briefs from companies looking for creators. Apply with a message and your price.
        </p>
      </header>

      {applied.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">Your applications</h2>
          {renderList(applied)}
        </section>
      )}

      <CreatorProjectBrowser projects={open} options={options} />
    </PageContainer>
  );
}
