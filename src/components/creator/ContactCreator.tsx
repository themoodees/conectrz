"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
 * Each new conversation uses one of the plan's conversations: once in total on
 * Free, per billing period on paid plans.
 */
export function ContactCreator({
  creatorId,
  creatorName,
  usage,
  upgradePlans,
}: ContactCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState<StartConversationState, FormData>(
    startConversation,
    {},
  );

  const remaining = usage ? Math.max(usage.quota - usage.used, 0) : 0;
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
        Contact creator
      </button>

      {usage && atLimit ? (
        <div id="contact-usage">
          <UpgradeSuggestion isFree={usage.isFree} quota={usage.quota} plans={upgradePlans} />
        </div>
      ) : (
        <p id="contact-usage" className="mt-2 text-xs text-muted">
          {!usage ? (
            <>
              No active plan.{" "}
              <Link href="/plans" className="font-medium text-primary hover:text-primary-hover">
                See plans
              </Link>
            </>
          ) : usage.isFree ? (
            `${remaining} of ${usage.quota} free ${usage.quota === 1 ? "conversation" : "conversations"} left.`
          ) : (
            `${remaining} of ${usage.quota} new conversations left this period.`
          )}
        </p>
      )}

      <Modal title={`Message ${creatorName}`} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="creatorId" value={creatorId} />
          {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
          <TextAreaField
            label="Your message"
            name="content"
            required
            maxLength={5000}
            rows={6}
            placeholder="Introduce your brand and what you'd like to work on together."
          />
          <p className="text-xs text-muted">
            Starting this conversation uses 1 of your {remaining} remaining
            {usage?.isFree ? " free" : ""} conversations. Replies are unlimited.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={buttonClass({ variant: "ghost" })}
            >
              Cancel
            </button>
            <button type="submit" disabled={pending} className={buttonClass()}>
              {pending ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
