"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { usdToCents } from "@/lib/format";
import { parsePaymentMethods, type PaymentMethod } from "@/lib/payments";
import { MOCK_CREATOR_ID, mockCompanyAccount } from "@/mocks/account";
import { mockStore } from "@/mocks/store";

export interface ProjectActionState {
  error?: string;
  success?: string;
}

const MAX_TITLE = 120;
const MAX_DESCRIPTION = 3000;
const MAX_MESSAGE = 2000;
const MAX_AMOUNT_USD = 10_000_000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function revalidateProjects(projectId?: string) {
  revalidatePath("/projects", "layout");
  revalidatePath("/creator/projects", "layout");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/creator/projects/${projectId}`);
  }
}

const wholeDollars = (value: FormDataEntryValue | null) => {
  const text = String(value ?? "").replace(/[,\s$]/g, "");
  return /^\d+$/.test(text) ? Number(text) : NaN;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

/* ── Company: post and manage projects ────────────────────────────────────── */

const MAX_REFERENCE_LINKS = 5;
const MAX_REFERENCE_IMAGES = 6;

function isWebLink(value: string) {
  if (value.length > 500) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

interface ProjectValues {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  serviceIds: string[];
  nicheIds: string[];
  languageIds: string[];
  paymentMethods: PaymentMethod[];
  referenceLinks: string[];
  referenceImages: string[];
}

/** Reads and validates the post / edit project form. */
async function parseProjectForm(
  formData: FormData,
): Promise<{ error: string } | { values: ProjectValues }> {
  const t = await getTranslations("app.projectErrors");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const budget = wholeDollars(formData.get("budget"));
  const deadline = String(formData.get("deadline") ?? "");
  const serviceIds = formData.getAll("serviceIds").map(String);
  const nicheIds = formData.getAll("nicheIds").map(String);
  const languageIds = formData.getAll("languageIds").map(String);
  const paymentMethods = parsePaymentMethods(formData.getAll("paymentMethods").map(String));
  const referenceLinks = formData
    .getAll("referenceLinks")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const referenceImages = formData.getAll("referenceImages").map(String).filter(Boolean);

  if (!title) return { error: t("enterTitle") };
  if (title.length > MAX_TITLE) return { error: t("titleTooLong", { max: MAX_TITLE }) };
  if (!description) return { error: t("describe") };
  if (description.length > MAX_DESCRIPTION) {
    return { error: t("descTooLong", { max: MAX_DESCRIPTION.toLocaleString() }) };
  }
  if (!Number.isInteger(budget) || budget <= 0 || budget > MAX_AMOUNT_USD) {
    return { error: t("budgetInvalid") };
  }
  if (
    referenceLinks.length > MAX_REFERENCE_LINKS ||
    referenceImages.length > MAX_REFERENCE_IMAGES
  ) {
    return {
      error: t("tooManyRefs", { links: MAX_REFERENCE_LINKS, images: MAX_REFERENCE_IMAGES }),
    };
  }
  if (!referenceLinks.every(isWebLink)) {
    return { error: t("refLinkInvalid") };
  }
  if (paymentMethods.length === 0) {
    return { error: t("choosePayment") };
  }
  if (!DATE_PATTERN.test(deadline) || deadline < todayIso()) {
    return { error: t("deadlinePast") };
  }

  return {
    values: {
      title,
      description,
      budget,
      deadline,
      serviceIds,
      nicheIds,
      languageIds,
      paymentMethods,
      referenceLinks,
      referenceImages,
    },
  };
}

export async function createProject(
  _previous: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const t = await getTranslations("app.projectErrors");
  const parsed = await parseProjectForm(formData);
  if ("error" in parsed) return parsed;
  const {
    title,
    description,
    budget,
    deadline,
    serviceIds,
    nicheIds,
    languageIds,
    paymentMethods,
    referenceLinks,
    referenceImages,
  } = parsed.values;

  let projectId: string;

  if (isMockMode) {
    projectId = `pj-${Date.now()}`;
    mockStore.projects.push({
      id: projectId,
      companyId: mockCompanyAccount.id,
      companyName: mockCompanyAccount.companyName,
      title,
      description,
      budgetUsd: budget,
      deliveryDeadline: deadline,
      status: "open",
      createdAt: new Date().toISOString(),
      services: serviceIds,
      niches: nicheIds,
      languages: languageIds,
      paymentMethods,
      referenceLinks,
    });
  } else {
    if (![...serviceIds, ...nicheIds, ...languageIds].every((id) => UUID_PATTERN.test(id))) {
      return { error: t("invalidSelection") };
    }
    const { supabase, user } = await requireSupabaseUser();
    // Images were uploaded from the browser into the company's own folder; accept nothing else.
    if (!referenceImages.every((path) => path.startsWith(`${user.id}/`) && !path.includes(".."))) {
      return { error: t("invalidImage") };
    }
    const { data, error } = await supabase
      .from("projects")
      .insert({
        company_id: user.id,
        title,
        description,
        budget_usd_cents: usdToCents(budget),
        delivery_deadline: deadline,
        payment_methods: paymentMethods,
      })
      .select("id")
      .single();
    if (error || !data) return { error: t("postFailed") };
    projectId = data.id;

    const results = await Promise.all([
      serviceIds.length
        ? supabase
            .from("project_services")
            .insert(serviceIds.map((service_id) => ({ project_id: projectId, service_id })))
        : null,
      nicheIds.length
        ? supabase
            .from("project_niches")
            .insert(nicheIds.map((niche_id) => ({ project_id: projectId, niche_id })))
        : null,
      languageIds.length
        ? supabase
            .from("project_languages")
            .insert(languageIds.map((language_id) => ({ project_id: projectId, language_id })))
        : null,
      referenceLinks.length + referenceImages.length > 0
        ? supabase
            .from("project_references")
            .insert([
              ...referenceLinks.map((url) => ({ project_id: projectId, kind: "link", url })),
              ...referenceImages.map((url) => ({ project_id: projectId, kind: "image", url })),
            ])
        : null,
    ]);
    if (results.some((result) => result?.error)) {
      // Don't leave a half-saved project behind: close it so creators don't see it.
      await supabase.from("projects").update({ status: "closed" }).eq("id", projectId);
      return { error: t("saveDetailsFailed") };
    }
  }

  revalidateProjects();
  redirect(`/projects/${projectId}`);
}

export async function updateProject(
  _previous: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const t = await getTranslations("app.projectErrors");
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = await parseProjectForm(formData);
  if ("error" in parsed) return parsed;
  const v = parsed.values;

  if (isMockMode) {
    const project = mockStore.projects.find((p) => p.id === projectId);
    if (!project) return { error: t("notFound") };
    if (project.status !== "open") return { error: t("closedEdit") };
    Object.assign(project, {
      title: v.title,
      description: v.description,
      budgetUsd: v.budget,
      deliveryDeadline: v.deadline,
      services: v.serviceIds,
      niches: v.nicheIds,
      languages: v.languageIds,
      paymentMethods: v.paymentMethods,
      referenceLinks: v.referenceLinks,
      editedAt: new Date().toISOString(),
    });
  } else {
    if (!UUID_PATTERN.test(projectId)) return { error: t("notFound") };
    if (![...v.serviceIds, ...v.nicheIds, ...v.languageIds].every((id) => UUID_PATTERN.test(id))) {
      return { error: t("invalidSelection") };
    }
    const { supabase, user } = await requireSupabaseUser();
    if (
      !v.referenceImages.every((path) => path.startsWith(`${user.id}/`) && !path.includes(".."))
    ) {
      return { error: t("invalidImage") };
    }
    // One transaction in the database: the brief and its tags/references change together.
    const { data: removedImages, error } = await supabase.rpc("update_project", {
      p_project_id: projectId,
      p_title: v.title,
      p_description: v.description,
      p_budget_usd_cents: usdToCents(v.budget),
      p_delivery_deadline: v.deadline,
      p_payment_methods: v.paymentMethods,
      p_service_ids: v.serviceIds,
      p_niche_ids: v.nicheIds,
      p_language_ids: v.languageIds,
      p_reference_links: v.referenceLinks,
      p_reference_images: v.referenceImages,
    });
    if (error) {
      if (error.message.includes("project_closed")) return { error: t("closedEdit") };
      if (error.message.includes("project_not_found")) return { error: t("notFound") };
      return { error: t("updateFailed") };
    }
    // Images the company removed from the brief: delete the files too (best effort).
    if (removedImages?.length) {
      await supabase.storage.from("project-references").remove(removedImages);
    }
  }

  revalidateProjects(projectId);
  redirect(`/projects/${projectId}`);
}

export async function setProjectStatus(
  projectId: string,
  status: "open" | "closed",
): Promise<ProjectActionState> {
  const t = await getTranslations("app.projectErrors");
  if (isMockMode) {
    const project = mockStore.projects.find((p) => p.id === projectId);
    if (!project) return { error: t("notFound") };
    project.status = status;
  } else {
    const { supabase, user } = await requireSupabaseUser();
    const { error } = await supabase
      .from("projects")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("company_id", user.id);
    if (error) {
      return {
        error: error.message.includes("company_not_active") ? t("pausedReopen") : t("updateFailed"),
      };
    }
  }
  revalidateProjects(projectId);
  return { success: status === "closed" ? t("projectClosed") : t("projectReopened") };
}

export async function declineApplication(
  applicationId: string,
  projectId: string,
): Promise<ProjectActionState> {
  const t = await getTranslations("app.projectErrors");
  if (isMockMode) {
    const application = mockStore.applications.find((a) => a.id === applicationId);
    if (!application || application.status !== "submitted") {
      return { error: t("cantChange") };
    }
    application.status = "declined";
  } else {
    const { supabase } = await requireSupabaseUser();
    const { error } = await supabase
      .from("project_applications")
      .update({ status: "declined" })
      .eq("id", applicationId);
    if (error) {
      return {
        error: error.message.includes("project_closed") ? t("closedDecline") : t("declineFailed"),
      };
    }
  }
  revalidateProjects(projectId);
  return { success: t("declined") };
}

/* ── Creator: apply and withdraw ──────────────────────────────────────────── */

export async function applyToProject(
  _previous: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const t = await getTranslations("app.projectErrors");
  const projectId = String(formData.get("projectId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const amount = wholeDollars(formData.get("amount"));

  if (!message) return { error: t("enterMessage") };
  if (message.length > MAX_MESSAGE) {
    return { error: t("msgTooLong", { max: MAX_MESSAGE.toLocaleString() }) };
  }
  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT_USD) {
    return { error: t("enterPrice") };
  }

  if (isMockMode) {
    const project = mockStore.projects.find((p) => p.id === projectId);
    if (!project || project.status !== "open") return { error: t("closed") };
    if (
      mockStore.applications.some(
        (a) => a.projectId === projectId && a.creatorId === MOCK_CREATOR_ID,
      )
    ) {
      return { error: t("alreadyApplied") };
    }
    mockStore.applications.push({
      id: `ap-${Date.now()}`,
      projectId,
      creatorId: MOCK_CREATOR_ID,
      message,
      proposedAmountUsd: amount,
      status: "submitted",
      createdAt: new Date().toISOString(),
    });
  } else {
    if (!UUID_PATTERN.test(projectId)) return { error: t("notFound") };
    const { supabase, user } = await requireSupabaseUser();
    const { error } = await supabase.from("project_applications").insert({
      project_id: projectId,
      creator_id: user.id,
      message,
      proposed_amount_usd_cents: usdToCents(amount),
    });
    if (error) {
      if (error.code === "23505") return { error: t("alreadyApplied") };
      if (error.code === "42501") {
        return {
          error: t("notPublished"),
        };
      }
      return { error: t("sendFailed") };
    }
  }

  revalidateProjects(projectId);
  return { success: t("sent") };
}

export async function withdrawApplication(
  applicationId: string,
  projectId: string,
): Promise<ProjectActionState> {
  const t = await getTranslations("app.projectErrors");
  if (isMockMode) {
    const application = mockStore.applications.find(
      (a) => a.id === applicationId && a.creatorId === MOCK_CREATOR_ID,
    );
    if (!application || application.status !== "submitted") {
      return { error: t("cantChange") };
    }
    application.status = "withdrawn";
  } else {
    const { supabase } = await requireSupabaseUser();
    const { error } = await supabase
      .from("project_applications")
      .update({ status: "withdrawn" })
      .eq("id", applicationId);
    if (error) return { error: t("withdrawFailed") };
  }
  revalidateProjects(projectId);
  return { success: t("withdrawn") };
}

/* ── Creator: translate a brief ───────────────────────────────────────────── */

/** Asks the translate-project edge function to translate (and store) a brief for the reader. */
export async function translateProject(projectId: string): Promise<{ error?: string }> {
  const t = await getTranslations("app.projectErrors");
  if (isMockMode) return { error: t("translateUnavailable") };
  if (!UUID_PATTERN.test(projectId)) return { error: t("translateFailed") };

  const { supabase } = await requireSupabaseUser();
  const language = await getLocale();
  const { error } = await supabase.functions.invoke("translate-project", {
    body: { project_id: projectId, language },
  });
  if (error) return { error: t("translateFailed") };
  revalidatePath(`/creator/projects/${projectId}`);
  return {};
}
