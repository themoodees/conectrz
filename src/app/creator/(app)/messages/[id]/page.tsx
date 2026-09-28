import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConversationView } from "@/components/messages/ConversationView";
import { getConversation } from "@/lib/data/messages";

export const metadata: Metadata = { title: "Messages" };

export default async function CreatorConversationPage({
  params,
}: PageProps<"/creator/messages/[id]">) {
  const { id } = await params;
  const conversation = await getConversation("creator", id);
  if (!conversation) notFound();
  return (
    <ConversationView conversation={conversation} viewer="creator" backHref="/creator/messages" />
  );
}
