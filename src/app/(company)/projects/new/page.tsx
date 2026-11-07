import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getProjectFormOptions } from "@/lib/data/projects";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.companyProjects");
  return { title: t("post") };
}

export default async function NewProjectPage() {
  const t = await getTranslations("app.companyProjects");
  const options = await getProjectFormOptions();

  return (
    <PageContainer>
      <Link
        href="/projects"
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        {t("title")}
      </Link>
      <div className="max-w-2xl">
        <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-4xl">
          {t("post")}
        </h1>
        <p className="mt-2 mb-8 text-base text-muted">
          {t("newIntro")}
        </p>
        <ProjectForm options={options} />
      </div>
    </PageContainer>
  );
}
