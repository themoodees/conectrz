import { InboxShell } from "@/components/messages/InboxShell";
import { getConversations } from "@/lib/data/messages";

export default async function CreatorMessagesLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversations("creator");
  return (
    <InboxShell
      conversations={conversations}
      basePath="/creator/messages"
      emptyText="No messages yet. When a brand contacts you, the conversation appears here."
    >
      {children}
    </InboxShell>
  );
}
