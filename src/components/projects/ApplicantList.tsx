"use client";

import { PaymentMethodTags } from "@/components/payments/PaymentInfo";
import type { PaymentMethod } from "@/lib/payments";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { Applicant } from "@/types/projects";
import { declineApplication } from "@/lib/actions/projects";
import { formatShortDate, formatUsd } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/buttonStyles";
import { ApplicationStatusBadge } from "./ProjectBadges";

function ApplicantCard({
  applicant,
  projectId,
  canDecline,
  projectMethods,
}: {
  applicant: Applicant;
  projectId: string;
  canDecline: boolean;
  projectMethods: PaymentMethod[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <li className="rounded-card border border-border p-5">
      <div className="flex items-start gap-3">
        <Avatar src={applicant.photoUrl} name={applicant.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/creators/${applicant.creatorId}`}
              className="font-semibold text-ink hover:text-primary"
            >
              {applicant.name}
            </Link>
            {applicant.status !== "submitted" && <ApplicationStatusBadge status={applicant.status} />}
          </div>
          <p className="text-xs text-muted">Applied {formatShortDate(applicant.createdAt)}</p>
        </div>
        <p className="text-right">
          <span className="block text-lg font-semibold text-ink">
            {formatUsd(applicant.proposedAmountUsd)}
          </span>
          <span className="text-xs text-muted">proposed price</span>
        </p>
      </div>
      <p className="mt-3 text-sm whitespace-pre-line text-graphite">{applicant.message}</p>
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-muted">Accepts payment by</p>
        <PaymentMethodTags methods={applicant.paymentMethods} highlight={projectMethods} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/creators/${applicant.creatorId}`}
          className={buttonClass({ size: "sm" })}
        >
          View profile &amp; message
        </Link>
        {canDecline && applicant.status === "submitted" && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await declineApplication(applicant.id, projectId);
                setError(result.error);
              })
            }
            className={buttonClass({ variant: "danger", size: "sm" })}
          >
            Decline
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </li>
  );
}

/** Everyone who applied to a project. */
export function ApplicantList({
  applicants,
  projectId,
  projectIsOpen,
  projectMethods,
}: {
  applicants: Applicant[];
  projectMethods: PaymentMethod[];
  projectId: string;
  projectIsOpen: boolean;
}) {
  return (
    <ul className="space-y-3">
      {applicants.map((applicant) => (
        <ApplicantCard
          key={applicant.id}
          applicant={applicant}
          projectId={projectId}
          canDecline={projectIsOpen}
          projectMethods={projectMethods}
        />
      ))}
    </ul>
  );
}
