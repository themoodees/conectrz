"use client";

import { useState, useTransition } from "react";
import type { ProjectStatus } from "@/types/projects";
import { setProjectStatus } from "@/lib/actions/projects";
import { buttonClass } from "@/components/ui/buttonStyles";

/** Close an open project, or reopen a closed one. */
export function ProjectStatusButton({
  projectId,
  status,
}: {
  projectId: string;
  status: ProjectStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const next = status === "open" ? "closed" : "open";

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await setProjectStatus(projectId, next);
            setError(result.error);
          })
        }
        className={buttonClass({ variant: "secondary", size: "sm" })}
      >
        {status === "open" ? "Close project" : "Reopen project"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
