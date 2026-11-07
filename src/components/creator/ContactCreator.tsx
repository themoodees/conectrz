"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { startConversation, type StartConversationState } from "@/lib/actions/messages";
import type { ConversationUsage } from "@/lib/data/messages";
import type { Plan } from "@/types/plans";
import { UpgradeSuggestion } from "@/components/plans/UpgradeSuggestion";
import { buttonClass } from "@/components/ui/buttonStyles";
import { FormMessage } from "@/components/ui/FormMessage";
import { MessageIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { TextAreaField } from "@/components/ui/TextAreaField";

interface ContactCreatorProps {
  creatorId: string;
  creatorName: string;
  usage: ConversationUsage | null;
  /** Paid plans to suggest when the company runs out of conversations. */
  upgradePlans: Plan[];
}

/**
 * "Contact creator" button + first-message dialog.
 * Each new conversation uses one of the plan's conversations per billing period.
 * Free has none; Business is unlimited.
 */
export function ContactCreator({
  creatorId,
  creatorName,
  usage,
  upgradePlans,
}: ContactCreatorProps) {
  const t = useTranslations("app.contact");
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<StartConversationState, FormData>(
    startConversation,
    {},
  );

  const unlimited = usage?.quota === null;
  const remaining = usage
    ? usage.quota === null
      ? Infinity
      : Math.max(usage.quota - usage.used, 0)
    : 0;
  const atLimit = remaining === 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={atLimit}
        aria-describedby="contact-usage"
        className={buttonClass()}
      >
        <MessageIcon className="size-4" />
        {t("button")}
      </button>

      {usage && atLimit ? (
        <div id="contact-usage">
          <UpgradeSuggestion isFree={usage.isFree} plans={upgradePlans} />
        </div>
      ) : (
        <p id="contact-usage" className="mt-2 text-xs text-muted">
          {!usage ? (
            <>
              {t("noPlan")}{" "}
              <Link href="/plans" className="font-medium text-primary hover:text-primary-hover">
                {t("seePlans")}
              </Link>
            </>
          ) : unlimited ? (
            t("unlimited")
          ) : (
            t("left", { remaining, quota: usage.quota ?? 0 })
          )}
        </p>
      )}

      <Modal title={t("modalTitle", { name: creatorName })} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="creatorId" value={creatorId} />
          {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
          <TextAreaField
            label={t("yourMessage")}
            name="content"
            required
            maxLength={5000}
            rows={6}
            placeholder={t("placeholder")}
          />
          <p className="text-xs text-muted">
            {unlimited
              ? t("usesOneUnlimited")
              : t("usesOne", { remaining, isFree: String(Boolean(usage?.isFree)) })}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={buttonClass({ variant: "ghost" })}
            >
              {t("cancel")}
            </button>
            <button type="submit" disabled={pending} className={buttonClass()}>
              {pending ? t("sending") : t("send")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
