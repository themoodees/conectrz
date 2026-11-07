import { getTranslations } from "next-intl/server";
import { InboxShell } from "@/components/messages/InboxShell";
import { getConversations } from "@/lib/data/messages";

export default async function CreatorMessagesLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("app.inbox");
  const conversations = await getConversations("creator");
  return (
    <InboxShell
      conversations={conversations}
      basePath="/creator/messages"
      emptyText={t("creatorEmpty")}
    >
      {children}
    </InboxShell>
  );
}
