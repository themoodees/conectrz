import "server-only";
import { getLocale } from "next-intl/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Applicant,
  CompanyProject,
  CreatorProject,
  MyApplication,
  Project,
  ProjectFormInitial,
  ProjectFormOptions,
  ProjectReference,
} from "@/types/projects";
import type { Database } from "@/lib/supabase/database.types";
import { isMockMode } from "@/lib/config";
import { centsToUsd } from "@/lib/format";
import { parsePaymentMethods } from "@/lib/payments";
import { MOCK_CREATOR_ID, mockCompanyAccount } from "@/mocks/account";
import { mockCreators } from "@/mocks/creators";
import { mockFilterOptions } from "@/mocks/filterOptions";
import type { MockApplication, MockProject } from "@/mocks/projects";
import { mockStore } from "@/mocks/store";
import { localizedName } from "@/lib/i18n/names";
import { getSupabaseSession } from "./session";
import { signMedia } from "./storage";

/*
 * Projects. Companies see their own projects and applicants; creators see
 * open projects (through the `project_listings` view) and their own applications.
 * Services / niches / languages are stored as ids, so names are looked up separately.
 */

type Db = SupabaseClient<Database>;

/* ── Shared helpers ───────────────────────────────────────────────────────── */

async function loadNames(supabase: Db) {
  const locale = await getLocale();
  const load = async (table: "services" | "niches" | "languages") => {
    const { data, error } = await supabase.from(table).select("id, name, name_i18n");
    if (error) throw error;
    return new Map(data.map((row) => [row.id, localizedName(row, locale)]));
  };
  const [services, niches, languages] = await Promise.all([
    load("services"),
    load("niches"),
    load("languages"),
  ]);
  return { services, niches, languages };
}

const namesOf = (ids: string[] | null, lookup: Map<string, string>) =>
  (ids ?? []).flatMap((id) => (lookup.has(id) ? [lookup.get(id)!] : []));

export async function getProjectFormOptions(): Promise<ProjectFormOptions> {
  if (isMockMode) {
    const toOptions = (names: string[]) => names.map((name) => ({ id: name, name }));
    return {
      services: toOptions(mockFilterOptions.services),
      niches: toOptions(mockFilterOptions.niches),
      languages: toOptions(mockFilterOptions.languages),
    };
  }
  const { supabase } = await getSupabaseSession();
  const locale = await getLocale();
  const load = async (table: "services" | "niches" | "languages") => {
    const { data, error } = await supabase
      .from(table)
      .select("id, name, name_i18n")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return data.map((row) => ({ id: row.id, name: localizedName(row, locale) }));
  };
  const [services, niches, languages] = await Promise.all([
    load("services"),
    load("niches"),
    load("languages"),
  ]);
  return { services, niches, languages };
}

const fromMock = (project: MockProject): Project => ({
  id: project.id,
  companyId: project.companyId,
  title: project.title,
  description: project.description,
  budgetUsd: project.budgetUsd,
  deliveryDeadline: project.deliveryDeadline,
  status: project.status,
  createdAt: project.createdAt,
  editedAt: project.editedAt ?? null,
  companyName: project.companyName,
  services: project.services,
  niches: project.niches,
  languages: project.languages,
  paymentMethods: project.paymentMethods,
});

const newestFirst = <T extends { createdAt: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt);

/** Links and images attached to one project. Image paths become short-lived signed URLs. */
async function loadReferences(projectId: string): Promise<ProjectReference[]> {
  if (isMockMode) {
    const project = mockStore.projects.find((p) => p.id === projectId);
    return (project?.referenceLinks ?? []).map((url, index) => ({
      id: `${projectId}-ref-${index}`,
      kind: "link" as const,
      url,
    }));
  }
  const { supabase } = await getSupabaseSession();
  const { data, error } = await supabase
    .from("project_references")
    .select("id, kind, url")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  const images = data.filter((r) => r.kind === "image");
  const signed = await signMedia(
    supabase,
    "project-references",
    images.map((r) => r.url),
  );
  return data.flatMap((r): ProjectReference[] => {
    if (r.kind === "link") return [{ id: r.id, kind: "link", url: r.url }];
    const url = signed[images.findIndex((i) => i.id === r.id)];
    return url ? [{ id: r.id, kind: "image", url }] : [];
  });
}

/* ── Company side ─────────────────────────────────────────────────────────── */

const MOCK_COMPANY_ID = mockCompanyAccount.id;

/** The signed-in company's projects, newest first. */
export async function getCompanyProjects(): Promise<CompanyProject[]> {
  if (isMockMode) {
    return mockStore.projects
      .filter((p) => p.companyId === MOCK_COMPANY_ID)
      .map((p) => ({
        ...fromMock(p),
        applicantCount: mockStore.applications.filter(
          (a) => a.projectId === p.id && a.status === "submitted",
        ).length,
      }))
      .sort(newestFirst);
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return [];
  const [{ data: projects, error }, company] = await Promise.all([
    supabase.from("projects").select("*").eq("company_id", user.id),
    supabase.from("company_profiles").select("name").eq("id", user.id).maybeSingle(),
  ]);
  if (error) throw error;
  if (projects.length === 0) return [];

  const ids = projects.map((p) => p.id);
  const [services, niches, languages, applications, names] = await Promise.all([
    supabase.from("project_services").select("project_id, service_id").in("project_id", ids),
    supabase.from("project_niches").select("project_id, niche_id").in("project_id", ids),
    supabase.from("project_languages").select("project_id, language_id").in("project_id", ids),
    supabase
      .from("project_applications")
      .select("project_id, status")
      .in("project_id", ids)
      .eq("status", "submitted"),
    loadNames(supabase),
  ]);
  for (const result of [services, niches, languages, applications]) {
    if (result.error) throw result.error;
  }

  return projects
    .map((p): CompanyProject => ({
      id: p.id,
      companyId: user.id,
      title: p.title,
      description: p.description,
      budgetUsd: centsToUsd(p.budget_usd_cents),
      deliveryDeadline: p.delivery_deadline,
      status: p.status,
      createdAt: p.created_at,
      editedAt: p.edited_at,
      companyName: company.data?.name ?? "",
      services: namesOf(
        services.data!.filter((r) => r.project_id === p.id).map((r) => r.service_id),
        names.services,
      ),
      niches: namesOf(
        niches.data!.filter((r) => r.project_id === p.id).map((r) => r.niche_id),
        names.niches,
      ),
      languages: namesOf(
        languages.data!.filter((r) => r.project_id === p.id).map((r) => r.language_id),
        names.languages,
      ),
      paymentMethods: parsePaymentMethods(p.payment_methods),
      applicantCount: applications.data!.filter((a) => a.project_id === p.id).length,
    }))
    .sort(newestFirst);
}

/** One of the company's projects with everyone who applied. */
export async function getCompanyProject(
  id: string,
): Promise<{ project: CompanyProject; applicants: Applicant[] } | null> {
  const projects = await getCompanyProjects();
  const found = projects.find((p) => p.id === id);
  if (!found) return null;
  const project = { ...found, references: await loadReferences(id) };

  if (isMockMode) {
    const applicants = mockStore.applications
      .filter((a) => a.projectId === id)
      .flatMap((a): Applicant[] => {
        const creator = mockCreators.find((c) => c.id === a.creatorId);
        return creator
          ? [
              {
                id: a.id,
                creatorId: a.creatorId,
                name: creator.displayName,
                photoUrl: creator.photoUrl,
                message: a.message,
                proposedAmountUsd: a.proposedAmountUsd,
                status: a.status,
                createdAt: a.createdAt,
                paymentMethods: creator.paymentMethods ?? [],
              },
            ]
          : [];
      })
      .sort(newestFirst);
    return { project, applicants };
  }

  const { supabase } = await getSupabaseSession();
  const { data, error } = await supabase
    .from("project_applicants")
    .select(
      "id, creator_id, first_name, last_name, photo_url, message, proposed_amount_usd_cents, status, created_at, payment_methods",
    )
    .eq("project_id", id);
  if (error) throw error;
  const photos = await signMedia(
    supabase,
    "creator-photos",
    data.map((a) => a.photo_url),
  );

  const applicants = data
    .flatMap((a, index): Applicant[] =>
      a.id && a.creator_id && a.status && a.created_at
        ? [
            {
              id: a.id,
              creatorId: a.creator_id,
              name: [a.first_name, a.last_name].filter(Boolean).join(" ") || "Creator",
              photoUrl: photos[index],
              message: a.message ?? "",
              proposedAmountUsd: centsToUsd(a.proposed_amount_usd_cents ?? 0),
              status: a.status,
              createdAt: a.created_at,
              paymentMethods: parsePaymentMethods(a.payment_methods),
            },
          ]
        : [],
    )
    .sort(newestFirst);
  return { project, applicants };
}

/* ── Creator side ─────────────────────────────────────────────────────────── */

const mockApplicationOf = (a: MockApplication): MyApplication => ({
  id: a.id,
  message: a.message,
  proposedAmountUsd: a.proposedAmountUsd,
  status: a.status,
  createdAt: a.createdAt,
});

/**
 * Projects a creator can see: all open ones, plus closed ones they applied to.
 * Newest first.
 */
export async function getCreatorProjects(): Promise<CreatorProject[]> {
  if (isMockMode) {
    return mockStore.projects
      .map((p) => {
        const application = mockStore.applications.find(
          (a) => a.projectId === p.id && a.creatorId === MOCK_CREATOR_ID,
        );
        return { ...fromMock(p), application: application ? mockApplicationOf(application) : null };
      })
      .filter((p) => p.status === "open" || p.application)
      .sort(newestFirst);
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return [];
  const [listings, applications, names] = await Promise.all([
    supabase.from("project_listings").select("*"),
    supabase
      .from("project_applications")
      .select("id, project_id, message, proposed_amount_usd_cents, status, created_at")
      .eq("creator_id", user.id),
    loadNames(supabase),
  ]);
  if (listings.error) throw listings.error;
  if (applications.error) throw applications.error;

  return listings.data
    .flatMap((row): CreatorProject[] => {
      if (!row.id || !row.status || !row.created_at) return [];
      const application = applications.data.find((a) => a.project_id === row.id);
      return [
        {
          id: row.id,
          companyId: row.company_id ?? "",
          title: row.title ?? "",
          description: row.description ?? "",
          budgetUsd: centsToUsd(row.budget_usd_cents ?? 0),
          deliveryDeadline: row.delivery_deadline ?? "",
          status: row.status,
          createdAt: row.created_at,
          editedAt: row.edited_at,
          companyName: row.company_name ?? "",
          services: namesOf(row.service_ids, names.services),
          niches: namesOf(row.niche_ids, names.niches),
          languages: namesOf(row.language_ids, names.languages),
          paymentMethods: parsePaymentMethods(row.payment_methods),
          application: application
            ? {
                id: application.id,
                message: application.message,
                proposedAmountUsd: centsToUsd(application.proposed_amount_usd_cents),
                status: application.status,
                createdAt: application.created_at,
              }
            : null,
        },
      ];
    })
    .sort(newestFirst);
}

export async function getCreatorProject(id: string): Promise<CreatorProject | null> {
  const projects = await getCreatorProjects();
  const project = projects.find((p) => p.id === id);
  return project ? { ...project, references: await loadReferences(id) } : null;
}

export interface ProjectTranslation {
  title: string;
  description: string;
  sourceLanguage: string;
}

/** The stored translation of a brief into the reader's language, if one exists yet. */
export async function getProjectTranslation(projectId: string): Promise<ProjectTranslation | null> {
  if (isMockMode) return null;
  const { supabase } = await getSupabaseSession();
  const language = await getLocale();
  const { data } = await supabase
    .from("project_translations")
    .select("title, description, source_language")
    .eq("project_id", projectId)
    .eq("language", language)
    .maybeSingle();
  return data
    ? { title: data.title, description: data.description, sourceLanguage: data.source_language }
    : null;
}

/** An open project of the signed-in company with the ids the edit form needs, or null. */
export async function getProjectForEdit(id: string): Promise<ProjectFormInitial | null> {
  if (isMockMode) {
    const project = mockStore.projects.find((p) => p.id === id && p.companyId === MOCK_COMPANY_ID);
    if (!project || project.status !== "open") return null;
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      budgetUsd: project.budgetUsd,
      deliveryDeadline: project.deliveryDeadline,
      serviceIds: project.services,
      nicheIds: project.niches,
      languageIds: project.languages,
      paymentMethods: project.paymentMethods,
      referenceLinks: project.referenceLinks ?? [],
      referenceImages: [],
    };
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("company_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!project || project.status !== "open") return null;

  const [services, niches, languages, references] = await Promise.all([
    supabase.from("project_services").select("service_id").eq("project_id", id),
    supabase.from("project_niches").select("niche_id").eq("project_id", id),
    supabase.from("project_languages").select("language_id").eq("project_id", id),
    supabase
      .from("project_references")
      .select("kind, url")
      .eq("project_id", id)
      .order("created_at"),
  ]);
  for (const result of [services, niches, languages, references]) {
    if (result.error) throw result.error;
  }
  const imagePaths = references.data!.filter((r) => r.kind === "image").map((r) => r.url);
  const previews = await signMedia(supabase, "project-references", imagePaths);

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    budgetUsd: centsToUsd(project.budget_usd_cents),
    deliveryDeadline: project.delivery_deadline,
    serviceIds: services.data!.map((r) => r.service_id),
    nicheIds: niches.data!.map((r) => r.niche_id),
    languageIds: languages.data!.map((r) => r.language_id),
    paymentMethods: parsePaymentMethods(project.payment_methods),
    referenceLinks: references.data!.filter((r) => r.kind === "link").map((r) => r.url),
    referenceImages: imagePaths.flatMap((path, index) =>
      previews[index] ? [{ path, previewUrl: previews[index] }] : [],
    ),
  };
}
