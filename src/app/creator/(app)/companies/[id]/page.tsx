import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RatingSummary } from "@/components/creator/RatingSummary";
import { ReviewForm } from "@/components/creator/ReviewForm";
import { ReviewsSection } from "@/components/creator/ReviewsSection";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { deleteCompanyReview, saveCompanyReview } from "@/lib/actions/reviews";
import { getCompanyPage } from "@/lib/data/companies";
import { formatShortDate, getInitials } from "@/lib/format";

export const metadata: Metadata = { title: "Brand" };

export default async function CompanyPage({ params }: PageProps<"/creator/companies/[id]">) {
  const { id } = await params;
  const page = await getCompanyPage(id);
  if (!page) notFound();
  const { company, reviews, openProjects, canReview } = page;
  const mine = reviews.find((r) => r.isMine) ?? null;

  return (
    <PageContainer>
      <Link
        href="/creator/projects"
        className="mt-6 mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-graphite hover:text-ink md:mt-8"
      >
        <ArrowLeftIcon className="size-4" />
        Projects
      </Link>

      <header className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-primary-light text-xl font-semibold text-primary">
          {getInitials(company.name)}
        </span>
        <div>
          <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-3xl">
            {company.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
            <span>On Conectrz since {formatShortDate(company.joinedAt)}</span>
            <RatingSummary average={company.ratingAverage} count={company.reviewCount} />
          </p>
        </div>
      </header>

      <section className="mt-10" aria-labelledby="brand-projects-heading">
        <h2 id="brand-projects-heading" className="mb-4 text-2xl font-semibold text-ink">
          Open projects
        </h2>
        {openProjects.length === 0 ? (
          <p className="text-sm text-muted">No open projects right now.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {openProjects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} href={`/creator/projects/${project.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ReviewsSection
        reviews={reviews.map((r) => ({ ...r, name: r.creatorName }))}
        form={
          canReview ? (
            <ReviewForm
              existing={mine}
              save={saveCompanyReview.bind(null, company.id)}
              remove={deleteCompanyReview.bind(null, company.id)}
              placeholder="How was it to work with this brand?"
            />
          ) : undefined
        }
      />
    </PageContainer>
  );
}
