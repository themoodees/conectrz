import type { PaymentMethod } from "@/lib/payments";

/*
 * Projects: a company posts a brief; creators apply with a message and a
 * proposed price. Amounts are whole US dollars (cents in the database).
 */

export type ProjectStatus = "open" | "closed";
export type ApplicationStatus = "submitted" | "declined" | "withdrawn";

/** A link or image the company attached to a project. `url` is the link, or a signed image URL. */
export interface ProjectReference {
  id: string;
  kind: "link" | "image";
  url: string;
}

export interface Project {
  id: string;
  /** The company that posted it (links to its page). */
  companyId: string;
  title: string;
  description: string;
  budgetUsd: number;
  /** ISO date, "2026-12-15" */
  deliveryDeadline: string;
  status: ProjectStatus;
  createdAt: string;
  /** When the company last changed the brief itself, or null if never edited. */
  editedAt?: string | null;
  companyName: string;
  /** Names of the wanted services, niches and languages. */
  services: string[];
  niches: string[];
  languages: string[];
  /** How the company says it will pay. */
  paymentMethods: PaymentMethod[];
  /** Only loaded on the project page, not in lists. */
  references?: ProjectReference[];
}

/** A project in the company's own list. */
export interface CompanyProject extends Project {
  /** Applications still waiting for a decision. */
  applicantCount: number;
}

export interface Applicant {
  id: string;
  creatorId: string;
  name: string;
  photoUrl: string | null;
  message: string;
  proposedAmountUsd: number;
  status: ApplicationStatus;
  createdAt: string;
  /** Methods the creator accepts. */
  paymentMethods: PaymentMethod[];
}

/** The signed-in creator's own application to a project. */
export interface MyApplication {
  id: string;
  message: string;
  proposedAmountUsd: number;
  status: ApplicationStatus;
  createdAt: string;
}

/** A project as a creator sees it. */
export interface CreatorProject extends Project {
  application: MyApplication | null;
}

/** Choices for the "post a project" form. */
export interface ProjectFormOptions {
  services: { id: string; name: string }[];
  niches: { id: string; name: string }[];
  languages: { id: string; name: string }[];
}

/** An existing project's values, to pre-fill the edit form. */
export interface ProjectFormInitial {
  id: string;
  title: string;
  description: string;
  budgetUsd: number;
  deliveryDeadline: string;
  serviceIds: string[];
  nicheIds: string[];
  languageIds: string[];
  paymentMethods: PaymentMethod[];
  referenceLinks: string[];
  /** Images already attached: storage path + a signed URL for the preview. */
  referenceImages: { path: string; previewUrl: string }[];
}
