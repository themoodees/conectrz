"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/buttonStyles";
import { BookmarkIcon, MessageIcon } from "@/components/ui/icons";
import { useSavedCreators } from "./useSavedCreators";

interface ProfileActionsProps {
  creatorId: string;
  isSaved: boolean;
  /** Set when the company already has a conversation with this creator. */
  conversationId: string | null;
}

/**
 * Contact + Save buttons on the Creator Profile.
 * Starting a new conversation isn't available yet (pending subscription/quota
 * decisions), so Contact is disabled unless a conversation already exists.
 */
export function ProfileActions({ creatorId, isSaved, conversationId }: ProfileActionsProps) {
  const { savedIds, toggleSave } = useSavedCreators(isSaved ? [creatorId] : []);
  const saved = savedIds.has(creatorId);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {conversationId ? (
          <Link href={`/messages/${conversationId}`} className={buttonClass()}>
            <MessageIcon className="size-4" />
            Open conversation
          </Link>
        ) : (
          <button
            type="button"
            disabled
            aria-describedby="contact-note"
            className={buttonClass()}
          >
            <MessageIcon className="size-4" />
            Contact creator
          </button>
        )}

        <button
          type="button"
          onClick={() => toggleSave(creatorId)}
          aria-pressed={saved}
          className={buttonClass({
            variant: "secondary",
            className: saved ? "border-primary/40 text-primary" : "",
          })}
        >
          <BookmarkIcon filled={saved} className="size-4" />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {!conversationId && (
        <p id="contact-note" className="mt-2 text-xs text-muted">
          Messaging new creators is coming soon.
        </p>
      )}
    </div>
  );
}
