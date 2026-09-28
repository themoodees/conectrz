import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageContainer } from "@/components/layout/PageContainer";
import { getCategories } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <PageContainer>
      <AdminPageHeader
        title="Categories"
        description="The niches, languages and services creators choose from and companies filter by."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <CategoryManager table="niches" title="Niches" categories={categories.niches} />
        <CategoryManager table="languages" title="Languages" categories={categories.languages} />
        <CategoryManager table="services" title="Services" categories={categories.services} />
      </div>
    </PageContainer>
  );
}
