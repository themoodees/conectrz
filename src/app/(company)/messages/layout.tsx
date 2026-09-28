import { InboxShell } from "@/components/messages/InboxShell";
import { getConversations } from "@/lib/data/messages";

export default async function CompanyMessagesLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversations("company");
  return (
    <InboxShell
      conversations={conversations}
      basePath="/messages"
      emptyText="No conversations yet. Contact a creator from their profile to start one."
    >
      {children}
    </InboxShell>
  );
}
