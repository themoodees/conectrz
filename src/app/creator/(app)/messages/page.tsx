import type { Metadata } from "next";
import { NoConversationSelected } from "@/components/messages/NoConversationSelected";

export const metadata: Metadata = { title: "Messages" };

export default function CreatorMessagesPage() {
  return <NoConversationSelected />;
}
