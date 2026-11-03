import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { ApplicationStatusBadge } from "@/components/projects/ProjectBadges";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { BriefcaseIcon } from "@/components/ui/icons";
import { getCreatorProjects } from "@/lib/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function CreatorProjectsPage() {
  const projects = await getCreatorProjects();
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

      <section>
        <h2 className="mb-4 text-lg font-semibold text-ink">Open projects</h2>
        {open.length > 0 ? (
          renderList(open)
        ) : (
          <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
              <BriefcaseIcon className="size-5" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">No open projects right now</h3>
            <p className="mt-1 max-w-sm text-sm text-muted">
              New projects from companies will show up here.
            </p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
