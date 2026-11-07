import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getProjectForEdit, getProjectFormOptions } from "@/lib/data/projects";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.companyProjects");
  return { title: t("edit") };
}

export default async function EditProjectPage({ params }: PageProps<"/projects/[id]/edit">) {
  const { id } = await params;
  const t = await getTranslations("app.companyProjects");
  const [initial, options] = await Promise.all([getProjectForEdit(id), getProjectFormOptions()]);
  // Only your own open projects can be edited.
  if (!initial) notFound();

  return (
    <PageContainer>
      <Link
        href={`/projects/${id}`}
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        {initial.title}
      </Link>
      <div className="max-w-2xl">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {t("edit")}
        </h1>
        <p className="mt-2 mb-8 text-base text-muted">{t("editIntro")}</p>
        <ProjectForm options={options} initial={initial} />
      </div>
    </PageContainer>
  );
}
