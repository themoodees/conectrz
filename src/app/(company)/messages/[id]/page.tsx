import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ConversationView } from "@/components/messages/ConversationView";
import { getConversation } from "@/lib/data/messages";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.inbox");
  return { title: t("title") };
}

export default async function CompanyConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const conversation = await getConversation("company", id);
  if (!conversation) notFound();
  return <ConversationView conversation={conversation} viewer="company" backHref="/messages" />;
}
