import { ConversationList } from "@/components/messages/ConversationList";
import { getConversations } from "@/lib/data/messages";

/**
 * Two-pane Messages layout: conversation list + open conversation.
 * Fills the screen below the header (and above the mobile tab bar).
 */
export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversations();

  return (
    <div className="mx-auto max-w-page md:px-6 md:py-6 lg:px-8">
      <div className="flex h-[calc(100dvh-8rem)] overflow-hidden bg-white md:h-[calc(100dvh-7rem)] md:rounded-card md:border md:border-border">
        <ConversationList conversations={conversations} />
        {children}
      </div>
    </div>
  );
}
