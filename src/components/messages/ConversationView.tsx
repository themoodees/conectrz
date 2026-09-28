import Link from "next/link";
import type { ConversationThread, Viewer } from "@/types/messages";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { ConversationMenu } from "./ConversationMenu";
import { MessageComposer } from "./MessageComposer";
import { MessageThread } from "./MessageThread";

interface ConversationViewProps {
  conversation: ConversationThread;
  viewer: Viewer;
  /** Where the mobile back arrow goes. */
  backHref: string;
}

/** Right pane of the inbox: header, messages and reply box. */
export function ConversationView({ conversation, viewer, backHref }: ConversationViewProps) {
  const { counterpart, messages, isArchived } = conversation;
  const hasUnread = messages.some((message) => !message.isMine && !message.readAt);

  return (
    <section
      className="flex min-w-0 flex-1 flex-col"
      aria-label={`Conversation with ${counterpart.name}`}
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-6">
        <Link
          href={backHref}
          aria-label="Back to conversations"
          className="-ml-2 grid size-9 place-items-center rounded-full text-graphite hover:bg-surface md:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>
        <Avatar src={counterpart.photoUrl} name={counterpart.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{counterpart.name}</p>
          {counterpart.profileHref ? (
            <Link
              href={counterpart.profileHref}
              className="text-xs font-medium text-muted hover:text-primary"
            >
              View profile
            </Link>
          ) : (
            <p className="text-xs text-muted">Company</p>
          )}
        </div>
        {isArchived && (
          <span className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-graphite">
            Archived
          </span>
        )}
        <ConversationMenu
          conversationId={conversation.id}
          counterpartName={counterpart.name}
          viewer={viewer}
          isArchived={isArchived}
        />
      </header>

      <MessageThread
        conversationId={conversation.id}
        viewer={viewer}
        messages={messages}
        hasUnread={hasUnread}
      />
      <MessageComposer conversationId={conversation.id} viewer={viewer} />
    </section>
  );
}
