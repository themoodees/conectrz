import type { Metadata } from "next";
import { ArchivedConversations } from "@/components/messages/ArchivedConversations";
import { getConversations } from "@/lib/data/messages";

export const metadata: Metadata = { title: "Archived conversations" };

export default async function CompanyArchivedPage() {
  const conversations = await getConversations("company", { archived: true });
  return <ArchivedConversations conversations={conversations} basePath="/messages" />;
}
