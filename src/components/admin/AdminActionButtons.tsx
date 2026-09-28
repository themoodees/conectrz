"use client";

import { useState, useTransition } from "react";
import type { AccountStatus } from "@/types/account";
import type { AccountKind } from "@/types/admin";
import { resolveReport, setAccountStatus, type AdminResult } from "@/lib/actions/admin";
import { buttonClass } from "@/components/ui/buttonStyles";

function useAdminAction() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AdminResult>({});
  const run = (action: () => Promise<AdminResult>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => setResult(await action()));
  };
  return { pending, result, run };
}

function ResultText({ result }: { result: AdminResult }) {
  if (result.error)
    return (
      <p role="alert" className="text-xs text-danger">
        {result.error}
      </p>
    );
  return null;
}

/** Dismiss / pause / ban buttons for a pending report. */
export function ReportActions({
  reportId,
  target,
}: {
  reportId: string;
  target: { kind: AccountKind; id: string; name: string } | null;
}) {
  const { pending, result, run } = useAdminAction();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => resolveReport(reportId, "dismissed", null))}
        className={buttonClass({ variant: "secondary", size: "sm" })}
      >
        Dismiss
      </button>
      {target && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                () => resolveReport(reportId, "paused", target),
                `Pause ${target.name}'s account?`,
              )
            }
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            Pause {target.kind}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(
                () => resolveReport(reportId, "banned", target),
                `Ban ${target.name}? Their account will be closed.`,
              )
            }
            className={buttonClass({ variant: "danger", size: "sm" })}
          >
            Ban {target.kind}
          </button>
        </>
      )}
      <ResultText result={result} />
    </div>
  );
}

/** Pause / reactivate / ban controls for an account row. */
export function AccountStatusActions({
  kind,
  accountId,
  name,
  status,
}: {
  kind: AccountKind;
  accountId: string;
  name: string;
  status: AccountStatus;
}) {
  const { pending, result, run } = useAdminAction();
  const change = (next: AccountStatus, confirmText?: string) =>
    run(() => setAccountStatus(kind, accountId, next), confirmText);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "active" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("paused", `Pause ${name}?`)}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("active", `Reactivate ${name}?`)}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          Reactivate
        </button>
      )}
      {status !== "deleted" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("deleted", `Ban ${name}? Their account will be closed.`)}
          className={buttonClass({ variant: "danger", size: "sm" })}
        >
          Ban
        </button>
      )}
      <ResultText result={result} />
    </div>
  );
}
