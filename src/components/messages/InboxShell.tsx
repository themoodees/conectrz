import type { ConversationSummary } from "@/types/messages";
import { ConversationList } from "./ConversationList";

/**
 * Two-pane inbox layout: conversation list + open conversation.
 * Fills the screen below the header (and above the mobile tab bar).
 */
export function InboxShell({
  conversations,
  basePath,
  emptyText,
  children,
}: {
  conversations: ConversationSummary[];
  basePath: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-page md:px-6 md:py-6 lg:px-8">
      <div className="flex h-[calc(100dvh-8rem)] overflow-hidden bg-white md:h-[calc(100dvh-7rem)] md:rounded-card md:border md:border-border">
        <ConversationList conversations={conversations} basePath={basePath} emptyText={emptyText} />
        {children}
      </div>
    </div>
  );
}
