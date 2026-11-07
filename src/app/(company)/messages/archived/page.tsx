import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArchivedConversations } from "@/components/messages/ArchivedConversations";
import { getConversations } from "@/lib/data/messages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.inbox");
  return { title: t("archivedConversations") };
}

export default async function CompanyArchivedPage() {
  const conversations = await getConversations("company", { archived: true });
  return <ArchivedConversations conversations={conversations} basePath="/messages" />;
}
