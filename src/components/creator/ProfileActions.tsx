"use client";

import Link from "next/link";
import type { ConversationUsage } from "@/lib/data/messages";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { buttonClass } from "@/components/ui/buttonStyles";
import { BookmarkIcon, MessageIcon } from "@/components/ui/icons";
import { ContactCreator } from "./ContactCreator";
import { useSavedCreators } from "./useSavedCreators";

interface ProfileActionsProps {
  creatorId: string;
  creatorName: string;
  isSaved: boolean;
  /** Set when the company already has an open conversation with this creator. */
  conversationId: string | null;
  usage: ConversationUsage | null;
}

/** Contact / Save / Report actions on the Creator Profile. */
export function ProfileActions({
  creatorId,
  creatorName,
  isSaved,
  conversationId,
  usage,
}: ProfileActionsProps) {
  const { savedIds, toggleSave } = useSavedCreators(isSaved ? [creatorId] : []);
  const saved = savedIds.has(creatorId);

  return (
    <div className="flex flex-wrap items-start gap-2">
      {conversationId ? (
        <Link href={`/messages/${conversationId}`} className={buttonClass()}>
          <MessageIcon className="size-4" />
          Open conversation
        </Link>
      ) : (
        <ContactCreator creatorId={creatorId} creatorName={creatorName} usage={usage} />
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

      <div className="flex h-11 items-center px-1">
        <ReportDialog targetType="creator" targetId={creatorId} targetName={creatorName} />
      </div>
    </div>
  );
}
