"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { usdToCents } from "@/lib/format";
import { parsePaymentMethods } from "@/lib/payments";
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

export async function createProject(
  _previous: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
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

  if (!title) return { error: "Enter a title." };
  if (title.length > MAX_TITLE) return { error: `Titles can be up to ${MAX_TITLE} characters.` };
  if (!description) return { error: "Describe what you need." };
  if (description.length > MAX_DESCRIPTION) {
    return { error: `Descriptions can be up to ${MAX_DESCRIPTION.toLocaleString()} characters.` };
  }
  if (!Number.isInteger(budget) || budget <= 0 || budget > MAX_AMOUNT_USD) {
    return { error: "Enter a budget in whole US dollars." };
  }
  if (referenceLinks.length > MAX_REFERENCE_LINKS || referenceImages.length > MAX_REFERENCE_IMAGES) {
    return {
      error: `You can add up to ${MAX_REFERENCE_LINKS} links and ${MAX_REFERENCE_IMAGES} images.`,
    };
  }
  if (!referenceLinks.every(isWebLink)) {
    return { error: "Reference links must be full web addresses starting with http:// or https://." };
  }
  if (paymentMethods.length === 0) {
    return { error: "Choose at least one way you will pay the creator." };
  }
  if (!DATE_PATTERN.test(deadline) || deadline < todayIso()) {
    return { error: "Choose a delivery deadline that is today or later." };
  }

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
      return { error: "Invalid selection." };
    }
    const { supabase, user } = await requireSupabaseUser();
    // Images were uploaded from the browser into the company's own folder; accept nothing else.
    if (!referenceImages.every((path) => path.startsWith(`${user.id}/`) && !path.includes(".."))) {
      return { error: "Invalid image." };
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
    if (error || !data) return { error: "Couldn't post your project. Please try again." };
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
        ? supabase.from("project_references").insert([
            ...referenceLinks.map((url) => ({ project_id: projectId, kind: "link", url })),
            ...referenceImages.map((url) => ({ project_id: projectId, kind: "image", url })),
          ])
        : null,
    ]);
    if (results.some((result) => result?.error)) {
      // Don't leave a half-saved project behind: close it so creators don't see it.
      await supabase.from("projects").update({ status: "closed" }).eq("id", projectId);
      return { error: "Couldn't save the project details. Please try again." };
    }
  }

  revalidateProjects();
  redirect(`/projects/${projectId}`);
}

export async function setProjectStatus(
  projectId: string,
  status: "open" | "closed",
): Promise<ProjectActionState> {
  if (isMockMode) {
    const project = mockStore.projects.find((p) => p.id === projectId);
    if (!project) return { error: "Project not found." };
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
        error: error.message.includes("company_not_active")
          ? "Your account is paused, so projects can't be reopened."
          : "Couldn't update the project. Please try again.",
      };
    }
  }
  revalidateProjects(projectId);
  return { success: status === "closed" ? "Project closed." : "Project reopened." };
}

export async function declineApplication(
  applicationId: string,
  projectId: string,
): Promise<ProjectActionState> {
  if (isMockMode) {
    const application = mockStore.applications.find((a) => a.id === applicationId);
    if (!application || application.status !== "submitted") {
      return { error: "This application can't be changed." };
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
        error: error.message.includes("project_closed")
          ? "This project is closed. Reopen it to decline applications."
          : "Couldn't decline this application. Please try again.",
      };
    }
  }
  revalidateProjects(projectId);
  return { success: "Application declined." };
}

/* ── Creator: apply and withdraw ──────────────────────────────────────────── */

export async function applyToProject(
  _previous: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const projectId = String(formData.get("projectId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const amount = wholeDollars(formData.get("amount"));

  if (!message) return { error: "Write a short message to the company." };
  if (message.length > MAX_MESSAGE) {
    return { error: `Messages can be up to ${MAX_MESSAGE.toLocaleString()} characters.` };
  }
  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT_USD) {
    return { error: "Enter your price in whole US dollars." };
  }

  if (isMockMode) {
    const project = mockStore.projects.find((p) => p.id === projectId);
    if (!project || project.status !== "open") return { error: "This project is closed." };
    if (mockStore.applications.some((a) => a.projectId === projectId && a.creatorId === MOCK_CREATOR_ID)) {
      return { error: "You've already applied to this project." };
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
    if (!UUID_PATTERN.test(projectId)) return { error: "Project not found." };
    const { supabase, user } = await requireSupabaseUser();
    const { error } = await supabase.from("project_applications").insert({
      project_id: projectId,
      creator_id: user.id,
      message,
      proposed_amount_usd_cents: usdToCents(amount),
    });
    if (error) {
      if (error.code === "23505") return { error: "You've already applied to this project." };
      if (error.code === "42501") {
        return {
          error:
            "You can apply once your profile is published: add your prefecture, at least one language and one service. The project must also still be open.",
        };
      }
      return { error: "Couldn't send your application. Please try again." };
    }
  }

  revalidateProjects(projectId);
  return { success: "Application sent." };
}

export async function withdrawApplication(
  applicationId: string,
  projectId: string,
): Promise<ProjectActionState> {
  if (isMockMode) {
    const application = mockStore.applications.find(
      (a) => a.id === applicationId && a.creatorId === MOCK_CREATOR_ID,
    );
    if (!application || application.status !== "submitted") {
      return { error: "This application can't be changed." };
    }
    application.status = "withdrawn";
  } else {
    const { supabase } = await requireSupabaseUser();
    const { error } = await supabase
      .from("project_applications")
      .update({ status: "withdrawn" })
      .eq("id", applicationId);
    if (error) return { error: "Couldn't withdraw your application. Please try again." };
  }
  revalidateProjects(projectId);
  return { success: "Application withdrawn." };
}
