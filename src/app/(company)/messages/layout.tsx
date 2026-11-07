import { getTranslations } from "next-intl/server";
import { InboxShell } from "@/components/messages/InboxShell";
import { getConversations } from "@/lib/data/messages";

export default async function CompanyMessagesLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("app.inbox");
  const conversations = await getConversations("company");
  return (
    <InboxShell conversations={conversations} basePath="/messages" emptyText={t("companyEmpty")}>
      {children}
    </InboxShell>
  );
}
