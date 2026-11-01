import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getProjectFormOptions } from "@/lib/data/projects";

export const metadata: Metadata = { title: "Post a project" };

export default async function NewProjectPage() {
  const options = await getProjectFormOptions();

  return (
    <PageContainer>
      <Link
        href="/projects"
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        Projects
      </Link>
      <div className="max-w-2xl">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          Post a project
        </h1>
        <p className="mt-2 mb-8 text-base text-muted">
          Creators will see this brief and apply with a message and their price. All amounts are in
          US dollars.
        </p>
        <ProjectForm options={options} />
      </div>
    </PageContainer>
  );
}
